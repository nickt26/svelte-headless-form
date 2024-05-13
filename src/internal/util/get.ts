import { Equals, ValueDeep } from '../../types/Form';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getInternal = function <V = unknown, T extends object = object>(
	path: string | Array<string | number | symbol>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | undefined : V | undefined {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		!(typeof path === 'string' || Array.isArray(path))
	) {
		return undefined as any;
	}

	let current: any = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key]))) {
			return undefined as any;
		}
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	return current[last];
};
