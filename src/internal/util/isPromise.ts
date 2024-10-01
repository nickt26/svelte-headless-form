import { isObject } from './isObject';

export function isPromise<T>(value: T): value is Extract<T, Promise<T>> {
	return isObject(value) && typeof value?.then === 'function';
}
