import { isObject } from 'src/util/isObject';

export const allEquals = (toCompare: unknown, val: unknown): boolean => {
	if (!isObject(toCompare) && !Array.isArray(toCompare) && !isObject(val) && !Array.isArray(val))
		return toCompare === val;
	if (!isObject(toCompare) && !Array.isArray(toCompare) && (isObject(val) || Array.isArray(val)))
		return Object.values(val).every((x) => allEquals(toCompare, x) === true);
	if ((isObject(toCompare) || Array.isArray(toCompare)) && (isObject(val) || Array.isArray(val))) {
		const val1Keys = Object.keys(toCompare);
		const val2Keys = Object.keys(val);
		return (
			val1Keys.length === val2Keys.length &&
			(val1Keys as any[]).every((val1Key) => val2Keys.includes(val1Key) && allEquals(toCompare[val1Key], val[val1Key]))
		);
	}

	return false;
};
