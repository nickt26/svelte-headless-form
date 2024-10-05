import { canParseToInt } from './canParseToInt';
import { noFormUpdate, noValidate } from './clone';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setI } from './set';

export const removePropertyI = <T extends Record<PropertyKey, unknown> | any[]>(
	path: string,
	obj: T,
	preventUpdate?: boolean,
): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) {
		return obj;
	}
	const splitPath = path.split(/\./g);
	let val = obj;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		val = val[key];
		if (isNil(val) || (!isObject(val) && !Array.isArray(val))) {
			return obj;
		}
	}

	const lastKey = splitPath[splitPath.length - 1];

	const arrPath = path
		.split(/\./g)
		.slice(0, splitPath.length - 1)
		.join('.');
	if (Array.isArray(val) && canParseToInt(lastKey)) {
		const newVal = val.filter((_, i) => i !== parseInt(lastKey));
		setI(
			arrPath,
			preventUpdate ? [{ [noValidate]: true, [noFormUpdate]: true }, newVal] : newVal,
			obj,
		);
	} else if (Array.isArray(val) && !canParseToInt(lastKey)) return obj;
	else delete val[lastKey];

	return obj;
};
