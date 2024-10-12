import { canParseToInt } from './canParseToInt';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const setI = <V, T extends Record<PropertyKey, unknown> | any[]>(
	path: string | Array<PropertyKey>,
	val: V,
	obj: T,
): T => {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		!(typeof path === 'string' || Array.isArray(path))
	)
		return obj;

	let current: any = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

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
