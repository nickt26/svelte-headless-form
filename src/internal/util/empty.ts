import { isObject } from './isObject';

export type EmptyType<T> = T extends Array<any>
	? T
	: T extends object
	? object
	: T extends string
	? string
	: undefined;

export const empty = <T>(val: T): EmptyType<T> => {
	if (Array.isArray(val)) return [] as EmptyType<T>;
	if (isObject(val)) return {} as EmptyType<T>;
	if (typeof val === 'string') return '' as EmptyType<T>;
	return undefined as EmptyType<T>;
};
