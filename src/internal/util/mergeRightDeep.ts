import { isObject } from './isObject';

type MergeRightDeepOptions = Partial<{
	replaceArrays: boolean;
	onlySameKeys: boolean;
	onlyNewKeys: boolean;
	noUndefinedMerges: boolean;
}>;

export const mergeRightDeepImpure = <T extends object, S extends object>(
	left: T,
	right: S,
	options?: MergeRightDeepOptions,
): T & S => {
	for (const key in right) {
		const leftVal = left[key as unknown as keyof T];
		const rightVal = right[key];

		if (
			((isObject(leftVal) && isObject(rightVal)) ||
				(Array.isArray(leftVal) && Array.isArray(rightVal) && !options?.replaceArrays)) &&
			(options?.onlySameKeys ? key in left : true)
		)
			mergeRightDeepImpure(leftVal, rightVal, options);
		else if (
			rightVal !== undefined &&
			(options?.onlySameKeys ? key in left : options?.onlyNewKeys ? !(key in left) : true) &&
			options?.noUndefinedMerges
				? rightVal !== undefined
				: true
		)
			left[key as unknown as keyof T] = rightVal as any;
	}
	return left as T & S;
};
