import { empty } from 'src/util/empty';
import { isDate } from 'src/util/isDate';
import { isNil } from 'src/util/isNil';
import { isObject } from 'src/util/isObject';

export const clone = <T>(obj: T): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) return obj;
	if (isDate(obj)) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}

	const toReturn = empty(obj);
	for (const key in obj) {
		Object.assign(toReturn, {
			[key]: clone(obj[key])
		});
	}
	return toReturn as T;
};
