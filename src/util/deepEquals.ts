import { isObject } from 'src/util/isObject';

export const deepEquals = (val1: unknown, val2: unknown): boolean => {
	if (!isObject(val1) && !isObject(val2) && !Array.isArray(val1) && !Array.isArray(val2)) return val1 === val2;

	if ((isObject(val1) && isObject(val2)) || (Array.isArray(val1) && Array.isArray(val2))) {
		const val1Keys = Object.keys(val1);
		const val2Keys = Object.keys(val2);
		return (
			val1Keys.length === val2Keys.length &&
			(val1Keys as any[]).every((val1Key) => val2Keys.includes(val1Key) && deepEquals(val1[val1Key], val2[val1Key]))
		);
	}

	return false;
};
