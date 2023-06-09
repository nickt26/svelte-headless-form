import { empty } from './empty';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const clone = <T>(obj: T): T => {
	if (isNil(obj)) return obj;
	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}
	if (!isObject(obj) && !Array.isArray(obj)) return obj;

	const toReturn = empty(obj);
	for (const key in obj) {
		Object.assign(toReturn, {
			[key]: clone(obj[key])
		});
	}
	return toReturn as T;
};
