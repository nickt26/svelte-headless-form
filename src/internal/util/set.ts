import { Star, TriggerFields, Triggers, Values } from '../../types/Form';
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

export const setTriggerImpure = <T extends object, V extends string | { [Triggers]: string }>(
	path: string | Array<string | number | symbol>,
	val: V,
	obj: TriggerFields<T>,
): TriggerFields<T> => {
	if (isNil(obj) || !isObject(obj)) return obj;

	let current: any = obj;
	let splitPath = Array.isArray(path) ? path : path.split(/\./g).map((x) => (x === '*' ? Star : x));

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		const nextShouldBeArray = canParseToInt(splitPath[i + 1]);
		// if (key === '*') {
		// 	const nextKey = splitPath[i + 1];
		// 	if (nextKey === '*') {
		// 		if (
		// 			(!isObject(current['*']) && !Array.isArray(current['*'])) ||
		// 			((isObject(current['*']) || Array.isArray(current['*'])) &&
		// 				isNil(current['*'][Values as any]))
		// 		)
		// 			current['*'] = { [Values]: {} };
		// 		setTriggerImpure(splitPath[i + 1], val, current['*'][Values]);
		// 	} else {
		// 		if (
		// 			(!isObject(current[nextKey]) && !Array.isArray(current[nextKey])) ||
		// 			((isObject(current[nextKey]) || Array.isArray(current[nextKey])) &&
		// 				isNil(current[nextKey][Values as any]))
		// 		)
		// 			current[nextKey] = { [Values]: nextShouldBeArray ? [] : {} };
		// 		setTriggerImpure(splitPath[i + 1], val, current[nextKey][Values]);
		// 	}

		// 	return obj;
		// }
		let next = current[key];

		if (
			(!isObject(next) && !Array.isArray(next)) ||
			((isObject(next) || Array.isArray(next)) && isNil(next[Values as any]))
		)
			current[key] = {
				[Values]: nextShouldBeArray ? [] : {},
			};

		next = current[key][Values];

		current = next;
	}
	const lastKey = splitPath[splitPath.length - 1];
	if (Array.isArray(current[lastKey]?.[Triggers]))
		current[lastKey][Triggers].push((val as any)[Triggers]);
	else if (Array.isArray(current[lastKey])) current[lastKey].push(val);
	else current[lastKey] = [val];

	return obj;
};
