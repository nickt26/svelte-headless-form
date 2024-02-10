import { TriggerFields } from '../../types/Form';
import { canParseToInt } from './canParseToInt';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const setImpure = <V, T extends object>(path: string, val: V, obj: T): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string') return obj;

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		let next = current[key];
		if (!isObject(next) && !Array.isArray(next)) {
			current[key] = canParseToInt(splitPath[i + 1]) ? [] : {};
			next = current[key];
		}
		current = next;
	}
	const last = splitPath[splitPath.length - 1];
	current[last] = val;
	return obj;
};

export const setTriggerImpure = <V, T extends object>(
	path: string,
	val: V,
	obj: TriggerFields<T>,
): TriggerFields<T> => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string') return obj;

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		let next = current[key];

		const nextShouldBeArray = canParseToInt(splitPath[i + 1]);
		if (
			(!isObject(next) && !Array.isArray(next)) ||
			((isObject(next) || Array.isArray(next)) && isNil(next.values))
		) {
			current[key] = nextShouldBeArray
				? {
						values: [],
				  }
				: {
						values: {},
				  };
		}
		next = current[key]['values'];

		current = next;
	}
	const lastKey = splitPath[splitPath.length - 1];
	current[lastKey] = val;
	return obj;
};
