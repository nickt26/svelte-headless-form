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

	const lastPathItem = splitPath[splitPath.length - 1];

	if (Array.isArray(val) && canParseToInt(lastPathItem)) val.splice(parseInt(lastPathItem), 1);
	else if (Array.isArray(val) && !canParseToInt(lastPathItem)) return obj;
	else delete val[lastPathItem];
	return obj;
};
