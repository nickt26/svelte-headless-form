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
// | (MergeRightDeepOptionsCommon & {
// 		onlySameKeys?: boolean;
//   })
// | (MergeRightDeepOptionsCommon & {
// 		onlyNewKeys?: boolean;
//   });

type MergeRightDeepOptionsAll = MergeRightDeepOptionsCommon & {
	onlySameKeys?: boolean;
	onlyNewKeys?: boolean;
};

export function mergeRightDeepImpure<T extends object, S extends object>(
	left: T,
	right: S,
	options?: MergeRightDeepOptions,
): T & S {
	// if ((!isObject(left) || !isObject(right)) && (!Array.isArray(left) || !Array.isArray(right))) {
	// 	throw new Error('Both left and right must be objects');
	// }

	// if (isObject(options) && 'onlySameKeys' in options && 'onlyNewKeys' in options) {
	// 	throw new Error(
	// 		'Conflicting mergeRightDeep options: `onlySameKeys` and `onlyNewKeys` cannot be used together',
	// 	);
	// }

	if (Array.isArray(left) && Array.isArray(right)) {
		for (let i = 0; i < right.length; i++) {
			mergeRightLoop(left, right, i, options);
		}
	} else if (isObject(left) && isObject(right)) {
		const keys = Object.keys(right);
		for (let i = 0; i < keys.length; i++) {
			mergeRightLoop(left, right, keys[i], options);
		}
	}

	// const rightKeys = Object.keys(right);
	// for (const key of rightKeys) {
	// 	const leftVal = left[key];
	// 	const rightVal = right[key];

	// 	if (
	// 		((isObject(leftVal) && isObject(rightVal)) ||
	// 			(Array.isArray(leftVal) && Array.isArray(rightVal) && !replaceArrays)) &&
	// 		(onlySameKeys ? key in left : true)
	// 	) {
	// 		mergeRightDeepImpure(leftVal, rightVal, options);
	// 	} else if (
	// 		rightVal !== undefined &&
	// 		(onlySameKeys ? key in left : onlyNewKeys ? !(key in left) : true) &&
	// 		noUndefinedMerges
	// 			? rightVal !== undefined
	// 			: true
	// 	) {
	// 		left[key] = rightVal as any;
	// 	}
	// }
	return left as T & S;
}

function mergeRightLoop(
	left: object,
	right: object,
	key: string | number | symbol,
	options?: MergeRightDeepOptions,
) {
	// TODO: Look at moving this default option generation to the top level of mergeRightDeep for performance gains
	const {
		replaceArrays = false,
		noUndefinedMerges = false,
		onlySameKeys = false,
		onlyNewKeys = false,
	} = (options as MergeRightDeepOptionsAll) ?? {};
	const leftVal = left[key];
	const rightVal = right[key];

	if ((onlySameKeys && !(key in left)) || (onlyNewKeys && key in left)) {
		return;
	}
	// } else if (onlyNewKeys && key in left) {
	// 	return;
	// }

	if (
		(isObject(leftVal) && isObject(rightVal)) ||
		(Array.isArray(leftVal) && Array.isArray(rightVal) && !replaceArrays)
	) {
		mergeRightDeepImpure(leftVal, rightVal, options);
	} else if (noUndefinedMerges ? rightVal !== undefined : true) {
		left[key] = rightVal;
	}
}
