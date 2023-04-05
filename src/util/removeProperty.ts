import { canParseToInt } from 'src/util/canParseToInt';
import { dropLast } from 'src/util/dropLast';
import { isNil } from 'src/util/isNil';
import { isObject } from 'src/util/isObject';

export const removePropertyImpure = <T extends object>(path: string, obj: T): T => {
	const splitPath = path.split(/\./g);
	let val: any = obj;
	for (const key of dropLast(splitPath)) {
		val = val[key];
		if (isNil(val) || (!isObject(val) && !Array.isArray(val))) return obj;
	}

	if (Array.isArray(val) && canParseToInt(splitPath.at(-1)!)) val.splice(parseInt(splitPath.at(-1)!), 1);
	else if (Array.isArray(val) && !canParseToInt(splitPath.at(-1)!)) return obj;
	else delete val[splitPath.pop()!];
	return obj;
};
