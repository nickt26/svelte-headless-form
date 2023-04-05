import type { ValidatorFn } from 'src/types/Form';
import { clone } from 'src/util/clone';
import { getInternal } from 'src/util/get';

export const prepend = <T extends any[]>(val: T[keyof T], arr: T): T => {
	const list = clone(arr);
	list.unshift(val);
	return list;
};

export const prependImpure = <T extends object>(name: string, val: unknown, obj: T): T => {
	const res = getInternal<unknown[] | ValidatorFn<T>, T>(name, obj);
	if (Array.isArray(res)) res.unshift(val);
	return obj;
};
