import { isObject } from './isObject';

export const mergeRightDeepImpure = <T extends object, S extends object>(left: T, right: S): T & S => {
	const keys = Object.keys(right) as (keyof T)[] & (keyof S)[];
	for (const key of keys) {
		const leftVal = left[key];
		const rightVal = right[key];

		if ((isObject(leftVal) || Array.isArray(leftVal)) && (isObject(rightVal) || Array.isArray(rightVal)))
			mergeRightDeepImpure(leftVal, rightVal);
		else if (rightVal !== undefined) left[key] = rightVal as any;
	}
	return left as T & S;
};
