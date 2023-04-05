import { isArray } from 'src/util/isArray';
import { isNil } from 'src/util/isNil';
import { isObject } from 'src/util/isObject';

export const getInternal = function <V, T extends object>(path: string, obj: T): V | undefined {
	if (isNil(obj) || (!isObject(obj) && !isArray(obj))) return undefined;

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !isArray(current[key]))) return undefined;
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	return current[last] as V;
};
