import { canParseToInt } from 'src/util/canParseToInt';
import { isNil } from 'src/util/isNil';
import { isObject } from 'src/util/isObject';

export const setImpure = <V, T extends object>(path: string, val: V, obj: T): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) return obj;

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
