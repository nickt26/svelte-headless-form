import { canParseToInt } from './canParseToInt';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const removePropertyImpure = <T extends object>(path: string, obj: T): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) return obj;
	const splitPath = path.split(/\./g);
	let val: any = obj;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		val = val[key];
		if (isNil(val) || (!isObject(val) && !Array.isArray(val))) return obj;
	}

	if (Array.isArray(val) && canParseToInt(splitPath[splitPath.length - 1])) val.splice(parseInt(splitPath.at(-1)!), 1);
	else if (Array.isArray(val) && !canParseToInt(splitPath[splitPath.length - 1])) return obj;
	else delete val[splitPath.pop()!];
	return obj;
};
