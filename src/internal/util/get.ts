import { AllFields, CurrentObject, Star, TriggerFields, Triggers, Values } from '../../types/Form';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getInternal = function <V = unknown, T extends object = object>(
	path: string | Array<string | number | symbol>,
	obj: T,
): V | undefined {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		!(typeof path === 'string' || Array.isArray(path))
	)
		return undefined;

	let current: any = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key])))
			return undefined;
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	return current[last] as V;
};

const getTriggersInResultObject = (
	obj: any,
	formValues: any,
	fullPath: string,
	triggers: Set<string>,
	// fromStar: boolean = false,
) => {
	if (!isObject(obj) && !Array.isArray(obj)) return;

	const val = getInternal(fullPath, formValues);
	if (!isObject(val) && !Array.isArray(val)) return;

	// if (fromStar) {
	if (isObject(val))
		for (const key of Object.keys(val)) {
			if (key in obj) {
				const value = val[key];
				if (Array.isArray(value[Triggers])) {
					for (const trigger of value[Triggers]) triggers.add(trigger);
				}

				if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						const trigger = value[i];
						if (typeof trigger === 'string') {
							triggers.add(trigger);
							continue;
						}

						if (isObject(trigger) || Array.isArray(trigger)) {
							getTriggersInResultObject(trigger, formValues, `${fullPath}.${i}`, triggers);
						}
					}
				}

				if (isObject(value) && !(Values in value) && !(Star in value)) {
					getTriggersInResultObject(value, formValues, `${fullPath}.${key}`, triggers);
					continue;
				}

				if (isObject(value?.[Star]) || Array.isArray(value?.[Star])) {
					getTriggersInResultObject(value[Star], formValues, `${fullPath}.${key}`, triggers);
					// TODO: look at
				}

				if (isObject(value?.[Values]) || Array.isArray(value?.[Values])) {
					getTriggersInResultObject(value[Values], formValues, `${fullPath}.${key}`, triggers);
				}
			}
		}
	else if (Array.isArray(val))
		for (let i = 0; i < val.length; i++) {
			const value = val[i];
			for (const trigger of value[Triggers] ?? []) triggers.add(trigger);
			if (Array.isArray(value))
				for (let j = 0; j < value.length; j++) {
					const trigger = value[j];
					if (typeof trigger === 'string') triggers.add(trigger);
					getTriggersInResultObject(trigger, formValues, `${fullPath}.${i}`, triggers);
				}

			const newPath = `${fullPath}.${i}`;
			getTriggersInResultObject(value, formValues, newPath, triggers);
			getTriggersInResultObject(value[Star], formValues, newPath, triggers);
			getTriggersInResultObject(value[Values], formValues, newPath, triggers);
		}
	// return;
	// }

	// if (Array.isArray(val?.[Triggers])) {
	// 	for (const trigger of val[Triggers]) triggers.add(trigger);
	// }

	// if (isObject(val?.[Values] || Array.isArray(val?.[Values]))) {
	getTriggersInResultObject(val[Values], formValues, fullPath, triggers);
	// }

	// for (const key of Object.keys(val)) {
	// 	const value = val[key];
	// }
};

export const getTriggers = <T extends object>(
	path: string | Array<string>,
	obj: TriggerFields<T>,
	values: T,
	fullPath: string,
	triggers: Set<string> = new Set(),
	fromStar: boolean = false,
): Array<string> => {
	if (path.length === 0) {
		getTriggersInResultObject(obj, values, fullPath, triggers);
		return Array.from(triggers);
	}
	const splitPath = Array.isArray(path) ? path : path.split(/\./g).reverse();

	const key = splitPath.pop()!;

	if (!(key in obj)) return [];
	const current = (obj as any)[key];

	if (Array.isArray(current?.[Triggers]))
		for (const trigger of current[Triggers]) triggers.add(trigger);

	if (isObject(current) && !(Values in current) && !(Star in current))
		getTriggers(splitPath, current as TriggerFields, values, fullPath, triggers);
	else if (Array.isArray(current)) {
		if (splitPath.length === 0) for (const trigger of current) triggers.add(trigger);
		getTriggers(splitPath, current as TriggerFields, values, fullPath, triggers);
	}

	if (isObject(current?.[Star]) || Array.isArray(current?.[Star]))
		getTriggers(splitPath.slice(0, -1), current[Star] as TriggerFields, values, fullPath, triggers);

	if (isObject(current?.[Values]) || Array.isArray(current?.[Values]))
		getTriggers(splitPath, current[Values] as TriggerFields, values, fullPath, triggers);

	return Array.from(triggers);
};

export const getValidators = (
	path: string | Array<string | number | symbol>,
	obj: object,
	validators: Array<Function> = [],
): Array<Function> | undefined => {
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);
	let current: any = obj;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key])))
			return undefined;

		if (isObject(current[key])) {
			if (typeof current[key][CurrentObject] === 'function')
				validators.push(current[key][CurrentObject]);

			if (typeof current[key][AllFields] === 'function') validators.push(current[key][AllFields]);

			if (current[key][Values]) {
				current[key] = current[key][Values];
				continue;
			}
		}

		current = current[key];
	}
	const lastKey = splitPath[splitPath.length - 1];
	const last = current?.[lastKey];
	if (isObject(last)) {
		if (typeof last[CurrentObject] === 'function') validators.push(last[CurrentObject]);

		if (typeof last[AllFields] === 'function') validators.push(last[AllFields]);

		for (const key of Object.keys(last)) getValidators(key, last, validators);
	} else if (Array.isArray(last))
		for (let i = 0; i < last.length; i++) getValidators(`${i}`, last, validators);
	else if (typeof last === 'function') validators.push(current[lastKey]);

	return validators;
};
