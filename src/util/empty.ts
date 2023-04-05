import { isObject } from 'src/util/isObject';
import { isString } from 'src/util/isString';

export type EmptyType<T> = T extends object ? object : T extends any[] ? T[] : T extends string ? string : undefined;

export const empty = <T extends object>(val: T): EmptyType<T> => {
	if (Array.isArray(val)) return [] as EmptyType<T>;
	if (isObject(val)) return {} as EmptyType<T>;
	if (isString(val)) return '' as EmptyType<T>;
	return undefined as EmptyType<T>;
};
