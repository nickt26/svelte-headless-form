import { Star, TriggerFields, Triggers, Values } from '../../types/Form';
import { getInternal } from './get';
import { isObject } from './isObject';

const performObjTreeTraversal = <T extends object>(
	key: string | number,
	obj: TriggerFields<T>,
	formValues: T,
	fullPath: string | Array<string | number | symbol>,
	triggers: Set<string>,
) => {
	const value = obj[key];
	for (const trigger of value[Triggers] ?? []) triggers.add(trigger);
	if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			const trigger = value[i];
			if (typeof trigger === 'string') triggers.add(trigger);
			getChildTriggers(
				trigger,
				formValues,
				Array.isArray(fullPath) ? [...fullPath, i] : `${fullPath}.${i}`,
				triggers,
			);
		}
	}

	const newPath = Array.isArray(fullPath) ? [...fullPath, key] : `${fullPath}.${key}`;
	getChildTriggers(value, formValues, newPath, triggers);
	getChildTriggers(value[Star], formValues, newPath, triggers);
	getChildTriggers(value[Values], formValues, newPath, triggers);
};

const getChildTriggers = <T extends object>(
	obj: TriggerFields<T>,
	formValues: T,
	fullPath: string | Array<string | number | symbol>,
	triggers: Set<string>,
) => {
	if (!isObject(obj) && !Array.isArray(obj)) return;

	const val = getInternal(fullPath, formValues);
	if (!isObject(val) && !Array.isArray(val)) return;

	if (isObject(val)) {
		for (const key of Object.keys(val)) {
			if (!(key in obj)) continue;
			performObjTreeTraversal(key, obj, formValues, fullPath, triggers);
		}
	} else if (Array.isArray(val)) {
		for (let i = 0; i < val.length; i++) {
			if (!(i in obj)) continue;
			performObjTreeTraversal(i, obj, formValues, fullPath, triggers);
		}
	}
	getChildTriggers(val[Values], formValues, fullPath, triggers);
};

export const getTriggers = <T extends object>(
	path: string | Array<string | number | symbol>,
	obj: TriggerFields<T>,
	values: T,
	shouldFetchChildTriggers: boolean = true,
	fullPath: string | Array<string | number | symbol> = path,
	triggers: Set<string> = new Set(),
): Array<string> => {
	if (path.length === 0) {
		if (shouldFetchChildTriggers) getChildTriggers(obj, values, fullPath, triggers);

		return Array.from(triggers);
	}
	const splitPath = Array.isArray(path) ? [...path] : path.split(/\./g).reverse();

	const key = splitPath.pop()!;

	if (!(key in obj)) return [];

	const current = (obj as any)[key];

	if (Array.isArray(current?.[Triggers]))
		for (const trigger of current[Triggers]) triggers.add(trigger);

	if (isObject(current) && !(Values in current) && !(Star in current)) {
		getTriggers(
			splitPath,
			current as TriggerFields,
			values,
			shouldFetchChildTriggers,
			fullPath,
			triggers,
		);
	} else if (Array.isArray(current)) {
		if (splitPath.length === 0) for (const trigger of current) triggers.add(trigger);
		getTriggers(
			splitPath,
			current as TriggerFields,
			values,
			shouldFetchChildTriggers,
			fullPath,
			triggers,
		);
	}

	if (isObject(current?.[Star]) || Array.isArray(current?.[Star])) {
		getTriggers(
			splitPath.slice(0, -1),
			current[Star] as TriggerFields,
			values,
			shouldFetchChildTriggers,
			fullPath,
			triggers,
		);
	}

	if (isObject(current?.[Values]) || Array.isArray(current?.[Values])) {
		getTriggers(
			splitPath,
			current[Values] as TriggerFields,
			values,
			shouldFetchChildTriggers,
			fullPath,
			triggers,
		);
	}

	return Array.from(triggers);
};
