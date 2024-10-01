import { Equals, PartialErrorFields, ValueDeep } from '../../types/Form';
import { isNil } from './isNil';
import { isObject } from './isObject';

export class FieldNotFoundError extends Error {
	constructor() {
		super();
	}
}

export function getInternalSafe<
	V = unknown,
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | FieldNotFoundError : V | FieldNotFoundError;
export function getInternalSafe<V = unknown, T extends any[] = any[]>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | FieldNotFoundError : V | FieldNotFoundError;
export function getInternalSafe<V, T extends Record<PropertyKey, unknown> | any[]>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | FieldNotFoundError : V | FieldNotFoundError {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		(typeof path !== 'string' && !Array.isArray(path))
	) {
		return new FieldNotFoundError();
	}

	let current: Record<PropertyKey, unknown> | any[] = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key]))) {
			return new FieldNotFoundError();
		}
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	if (!(last in current)) {
		return new FieldNotFoundError();
	}
	return current[last];
}

export function getInternal<
	V = unknown,
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | undefined : V | undefined;
export function getInternal<V = unknown, T extends any[] = any[]>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | undefined : V | undefined;

export function getInternal<V, T extends Record<PropertyKey, unknown> | any[]>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | undefined : V | undefined;
export function getInternal<V, T extends Record<PropertyKey, unknown> | any[]>(
	path: string | Array<PropertyKey>,
	obj: T,
): Equals<V, unknown> extends true ? ValueDeep<T> | undefined : V | undefined {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		(typeof path !== 'string' && !Array.isArray(path))
	) {
		return undefined;
	}

	let current: Record<PropertyKey, unknown> | any[] = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key]))) {
			return undefined as any;
		}
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	return current[last];
}

export const getError = function <T extends object = object>(
	path: string | Array<PropertyKey>,
	errors: PartialErrorFields<T>,
): string | undefined {
	if (
		isNil(errors) ||
		(!isObject(errors) && !Array.isArray(errors)) ||
		(typeof path !== 'string' && !Array.isArray(path))
	) {
		return undefined;
	}

	let currentErrors: any = errors;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		const nextError = currentErrors[key];

		if (typeof nextError === 'string') return nextError;
		else if (!isObject(nextError) && !Array.isArray(nextError)) return undefined as any;

		currentErrors = nextError;
	}
	const last = splitPath[splitPath.length - 1];
	return currentErrors[last];
};
