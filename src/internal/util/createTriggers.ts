import { TriggerFields } from './../../types/Form';
import { getInternal, getTriggersAlongEntireTreePath } from './get';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setTriggerImpure } from './set';

export const createTriggers = <T extends object>(
	values: T,
	deps: Record<string | number | symbol, unknown> | any[] | string | undefined,
	currentKey: string = '',
	triggers: TriggerFields<T> = {},
): TriggerFields<T> => {
	if (!deps) return triggers;

	if (!isObject(deps) && !Array.isArray(deps)) {
		const depsValue = getInternal(deps, values);
		const fieldPath = currentKey.substring(0, currentKey.length - 2);

		if (fieldPath === deps) throw new Error(`Can't have a field depend on itself: '${fieldPath}'.`);

		// TODO: Cater for nested array/object fields that listen to any of their parents, so that we prevent infinite loops but still add the convenience of being able to listen to all other field changes in the parent
		// if (deps.startsWith(fieldPath))
		// 	throw new Error(
		// 		`Can't have a field depend on its parent object or array: '${fieldPath}'. This will cause an infinite loop `,
		// 	);

		const fieldTreePathTriggers = getTriggersAlongEntireTreePath(fieldPath, triggers);
		if (
			!isNil(fieldTreePathTriggers) &&
			(fieldTreePathTriggers.includes(fieldPath) ||
				fieldTreePathTriggers.some((x) => x.startsWith(deps)))
		)
			throw new Error(
				`Circular dependency detected for field: '${fieldPath}'. It depends on field: '${deps}' which is is also depending on '${fieldPath}'.`,
			);

		if (isObject(depsValue) || Array.isArray(depsValue))
			return setTriggerImpure(deps, { triggers: [fieldPath] }, triggers);
		else return setTriggerImpure(deps, [fieldPath], triggers);
	}

	for (const key of Object.keys(deps))
		createTriggers(values, deps[key as any], currentKey ? `${currentKey}.${key}` : key, triggers);

	return triggers;
};
