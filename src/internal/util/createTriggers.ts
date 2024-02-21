import { TriggerFields, allFieldsKey } from './../../types/Form';
import { getInternal } from './get';
import { isObject } from './isObject';
import { setTriggerImpure } from './set';

export const createTriggers = <T extends object>(
	values: T,
	deps: Record<string | number | symbol, unknown> | any[] | string | undefined,
	currentKey: Array<string | number | symbol> = [],
	triggers: TriggerFields<T> = {},
): TriggerFields<T> => {
	if (!deps) return triggers;

	if (!isObject(deps) && !Array.isArray(deps)) {
		const depsValue = getInternal(deps, values);
		// const fieldPath = currentKey.substring(0, currentKey.length - 2);
		const fieldPath = currentKey.slice(0, -1);

		// TODO: update this to work for [AllFields] check
		// if (fieldPath === deps) throw new Error(`Can't have a field depend on itself: '${fieldPath}'.`);

		// TODO: Cater for nested array/object fields that listen to any of their parents, so that we prevent infinite loops but still add the convenience of being able to listen to all other field changes in the parent
		// if (deps.startsWith(fieldPath))
		// 	throw new Error(
		// 		`Can't have a field depend on its parent object or array: '${fieldPath}'. This will cause an infinite loop `,
		// 	);

		// TODO: update this to work with new updates
		// const fieldTreePathTriggers = getTriggersAlongEntireTreePath(fieldPath, triggers);
		// if (
		// 	!isNil(fieldTreePathTriggers) &&
		// 	(fieldTreePathTriggers.includes(fieldPath) ||
		// 		fieldTreePathTriggers.some((x) => x.startsWith(deps)))
		// )
		// 	throw new Error(
		// 		`Circular dependency detected for field: '${fieldPath}'. It depends on field: '${deps}' which is is also depending on '${fieldPath}'.`,
		// 	);

		const lastKey = fieldPath[fieldPath.length - 1];
		// TODO: update createTriggers to potentially work without depsValue checks in case they are null or undefined at form inception or even a union with primitives and they start as primitive
		if (isObject(depsValue) || Array.isArray(depsValue)) {
			if (typeof lastKey === 'symbol' && lastKey.toString() === Symbol('*').toString())
				return setTriggerImpure(deps, fieldPath.slice(0, -1).join('.'), triggers, true);

			return setTriggerImpure(deps, fieldPath.join('.'), triggers, true);
		}

		if (typeof lastKey === 'symbol' && lastKey.toString() === Symbol(allFieldsKey).toString())
			return setTriggerImpure(deps, fieldPath.slice(0, -1).join('.'), triggers);

		return setTriggerImpure(deps, fieldPath.join('.'), triggers);
	}

	if (Array.isArray(deps))
		for (let i = 0; i < deps.length; i++)
			createTriggers(values, deps[i], currentKey.length ? [...currentKey, i] : [i], triggers);
	else if (isObject(deps)) {
		for (const key of Object.keys(deps))
			createTriggers(
				values,
				deps[key] as any,
				currentKey.length ? [...currentKey, key] : [key],
				triggers,
			);
		for (const key of Object.getOwnPropertySymbols(deps))
			createTriggers(
				values,
				deps[key] as any,
				currentKey.length ? [...currentKey, key] : [key],
				triggers,
			);
	}

	return triggers;
};
