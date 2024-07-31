import { TriggerFields, allKey, valuesKey } from './../../types/Form';
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
		const fieldPath = currentKey
			.filter((x) => !(typeof x === 'symbol' && x.toString() === Symbol(valuesKey).toString()))
			.slice(0, -1);

		const lastKey = fieldPath[fieldPath.length - 1];
		if (isObject(depsValue) || Array.isArray(depsValue)) {
			if (typeof lastKey === 'symbol' && lastKey.toString() === Symbol(allKey).toString())
				return setTriggerImpure(deps, fieldPath.slice(0, -1).join('.'), triggers, true);

			return setTriggerImpure(deps, fieldPath.join('.'), triggers, true);
		}

		if (typeof lastKey === 'symbol' && lastKey.toString() === Symbol(allKey).toString())
			return setTriggerImpure(deps, fieldPath.slice(0, -1).join('.'), triggers);

		return setTriggerImpure(deps, fieldPath.join('.'), triggers);
	}

	if (Array.isArray(deps)) {
		for (let i = 0; i < deps.length; i++) {
			createTriggers(values, deps[i], currentKey.length ? [...currentKey, i] : [i], triggers);
		}
	} else if (isObject(deps)) {
		const keys = Object.keys(deps);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			createTriggers(
				values,
				deps[key] as any,
				currentKey.length ? [...currentKey, key] : [key],
				triggers,
			);
		}
		const symbols = Object.getOwnPropertySymbols(deps);
		for (let i = 0; i < symbols.length; i++) {
			const key = symbols[i];
			createTriggers(
				values,
				deps[key] as any,
				currentKey.length ? [...currentKey, key] : [key],
				triggers,
			);
		}
	}

	return triggers;
};
