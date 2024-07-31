import { isObject } from './isObject';

type MergeRightDeepOptionsCommon = {
	replaceArrays?: boolean;
	noUndefinedMerges?: boolean;
};

type MergeRightDeepOptions1 = MergeRightDeepOptionsCommon & {
	onlySameKeys?: boolean;
	onlyNewKeys?: undefined;
};

type MergeRightDeepOptions2 = MergeRightDeepOptionsCommon & {
	onlyNewKeys?: boolean;
	onlySameKeys?: undefined;
};

type MergeRightDeepOptions = MergeRightDeepOptions1 | MergeRightDeepOptions2;

type MergeRightDeepOptionsAll = MergeRightDeepOptionsCommon & {
	onlySameKeys?: boolean;
	onlyNewKeys?: boolean;
};

export function mergeRightDeepImpure<T extends object, S extends object>(
	left: T | undefined,
	right: S | undefined,
	options?: MergeRightDeepOptions,
): T & S {
	const keys =
		(Array.isArray(left) && Array.isArray(right) && Object.keys(right)) ||
		(isObject(left) && isObject(right) && Object.keys(right));
	if (!keys) return left as T & S;

	const {
		replaceArrays = false,
		noUndefinedMerges = false,
		onlySameKeys = false,
		onlyNewKeys = false,
	} = (options as MergeRightDeepOptionsAll) ?? {};

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const leftVal = left[key];
		const rightVal = right[key];

		if ((onlySameKeys && !(key in left)) || (onlyNewKeys && key in left)) continue;

		if (
			(isObject(leftVal) && isObject(rightVal)) ||
			(Array.isArray(leftVal) && Array.isArray(rightVal) && !replaceArrays)
		) {
			mergeRightDeepImpure(leftVal, rightVal, options);
		} else if (noUndefinedMerges ? rightVal !== undefined : true) left[key] = rightVal;
	}

	return left as T & S;
}
