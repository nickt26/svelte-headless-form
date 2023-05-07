import { isObject } from './isObject';

export const mergeRightDeepImpure = <T extends object, S extends object>(
	left: T,
	right: S,
	options?: { replaceArrays?: boolean; onlySameKeys?: boolean },
): T & S => {
	const keys = Object.keys(right) as (keyof T)[] & (keyof S)[];
	for (const key of keys) {
		const leftVal = left[key];
		const rightVal = right[key];

		if (
			((isObject(leftVal) && isObject(rightVal)) ||
				(Array.isArray(leftVal) && Array.isArray(rightVal) && !options?.replaceArrays)) &&
			(options?.onlySameKeys ? key in left : true)
		)
			mergeRightDeepImpure(leftVal, rightVal, options);
		else if (rightVal !== undefined && (options?.onlySameKeys ? key in left : true)) left[key] = rightVal as any;
	}
	return left as T & S;
};
