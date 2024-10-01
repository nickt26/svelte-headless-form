import { Writable } from 'svelte/store';
import { BooleanFields } from '../../types/Form';
import { assign, assignUsingLeft } from './assign';
import { getInternal } from './get';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setI } from './set';

export const clone = <T>(obj: T): T => {
	if (isNil(obj)) return obj;
	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}
	if (!isObject(obj) && !Array.isArray(obj)) return obj;

	if (Array.isArray(obj)) return obj.map(clone) as T;

	const toReturn: Record<PropertyKey, unknown> = {};
	for (const key of Object.getOwnPropertySymbols(obj)) toReturn[key] = clone(obj[key]);
	for (const key of Object.keys(obj)) toReturn[key] = clone(obj[key]);

	return toReturn as T;
};

function getFlags(val: unknown): [boolean, { noValidate: boolean; noFormUpdate: boolean }] {
	const hasFlags =
		Array.isArray(val) && isObject(val[0]) && (noValidate in val[0] || noFormUpdate in val[0]);
	return [
		hasFlags,
		{
			noValidate: !!val?.[0]?.[noValidate],
			noFormUpdate: !!val?.[0]?.[noFormUpdate],
		},
	];
}

export const noValidate = Symbol('noValidate');
export const noFormUpdate = Symbol('noFormUpdate');
// const mutatingArrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice'] as cost;

export function cloneWithStoreReactivity<T>(
	obj: T extends Record<PropertyKey, unknown> ? T : T extends any[] ? never : T,
	store?: Writable<[Array<PropertyKey>, unknown, boolean] | null>,
	touched_store?: Writable<BooleanFields<T & (Record<PropertyKey, unknown> | any[])>>,
	dirty_store?: Writable<BooleanFields<T & (Record<PropertyKey, unknown> | any[])>>,
	path?: string | Array<PropertyKey>,
): T;
export function cloneWithStoreReactivity<T extends Record<PropertyKey, unknown>>(
	obj: T,
	store: Writable<[Array<PropertyKey>, unknown, boolean] | null>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	path?: string | Array<PropertyKey>,
): T;
export function cloneWithStoreReactivity<T extends any[]>(
	obj: T,
	store: Writable<[Array<PropertyKey>, unknown, boolean] | null>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	path?: string | Array<PropertyKey>,
): T;
export function cloneWithStoreReactivity<T>(
	obj: T,
	store?: Writable<[Array<PropertyKey>, unknown, boolean] | null>,
	touched_store?: Writable<BooleanFields<T & (Record<PropertyKey, unknown> | any[])>>,
	dirty_store?: Writable<BooleanFields<T & (Record<PropertyKey, unknown> | any[])>>,
	path?: string | Array<PropertyKey>,
): T {
	if (!isObject(obj) && !Array.isArray(obj)) {
		return obj;
	}

	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}

	// if (obj instanceof Map) {
	// 	const res = new Map();
	// 	obj.forEach((val, key) => {
	// 		const fullPath = path ? [...path, key] : [key];
	// 		const [hasFlags] = getFlags(val);
	// 		const newVal = hasFlags ? val[1] : val;
	// 		res.set(key, cloneWithStoreReactivity(newVal, store, touched_store, dirty_store, fullPath));
	// 	});
	// 	return res as T;
	// }

	// if (obj instanceof Set) {
	// 	const res = new Set();
	// 	obj.forEach((val) => {| string[]
	// 		const fullPath = path ? [...path, val] : [val];
	// 		const [hasFlags] = getFlags(val);
	// 		const newVal = hasFlags ? val[1] : val;
	// 		res.add(cloneWithStoreReactivity(newVal, store, touched_store, dirty_store, fullPath));
	// 	});
	// 	return res as T;
	// }

	if (obj instanceof File) {
		return new File([obj], obj.name, { type: obj.type, lastModified: obj.lastModified }) as T;
	}

	if (Array.isArray(obj)) {
		const res = obj.map((val, i) => {
			const fullPath = path ? [...path, `${i}`] : [`${i}`];
			const [hasFlags] = getFlags(val);
			const newVal = hasFlags ? val[1] : val;
			return cloneWithStoreReactivity(newVal, store, touched_store, dirty_store, fullPath);
		});
		// const suppressionMap = new WeakMap();
		const proxy = new Proxy(res, {
			// get(target, prop, receiver) {
			// 	if (!mutatingArrayMethods.includes(prop as any)) return Reflect.get(target, prop, receiver);

			// 	const suppressionStack = suppressionMap.get(receiver);
			// 	suppressionStack.push(true); // Suppress logging
			// 	const result = Reflect.get(target, prop, receiver);
			// 	suppressionStack.pop(); // Re-enable logging
			// 	return result;
			// },
			set(target, prop, val, receiver) {
				// const suppressionStack = suppressionMap.get(receiver) ?? [];
				// const suppressAction =
				// 	suppressionStack.length > 0 && suppressionStack[suppressionStack.length - 1];

				// if (suppressAction) return true;
				if (typeof prop === 'string' && isNaN(parseInt(prop)))
					return Reflect.set(target, prop, val, receiver);

				if (typeof prop !== 'string') return Reflect.set(target, prop, val, receiver);

				const fullPath = path ? [...path, prop] : [prop];
				console.log('setting', fullPath, val);

				const [hasFlags, { noValidate, noFormUpdate }] = getFlags(val);
				const newVal = hasFlags ? val[1] : val;
				target[parseInt(prop)] = cloneWithStoreReactivity(
					newVal,
					store,
					touched_store,
					dirty_store,
					fullPath,
				);

				if (!noFormUpdate) {
					dirty_store?.update((x) => setI(fullPath, assign(true, target[parseInt(prop)]), x));
					touched_store?.update((x) =>
						setI(
							fullPath,
							assignUsingLeft(false, target[parseInt(prop)], getInternal(fullPath, x)!),
							x,
						),
					);
				}
				if (store) store.set([fullPath, newVal, noValidate]);

				return true;
			},
		});
		// suppressionMap.set(proxy, []);

		// function wrapArrayMethod(methodName: string) {
		// 	// @ts-ignore
		// 	const originalMethod = proxy.prototype[methodName];
		// 	// @ts-ignore
		// 	proxy.prototype[methodName] = function (...args: any[]) {
		// 		const suppressionStack = suppressionMap.get(proxy);
		// 		suppressionStack.push(true); // Suppress logging
		// 		const result = originalMethod.apply(this, args);
		// 		suppressionStack.pop(); // Re-enable logging
		// 		return result;
		// 	};
		// }

		// ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(wrapArrayMethod);

		return proxy as T;
	}

	const res = {};
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const fullPath = path ? [...path, key] : [key];
		let newObj = cloneWithStoreReactivity(obj[key], store, touched_store, dirty_store, fullPath);

		Object.defineProperty(res, key, {
			get() {
				return newObj;
			},
			set(val) {
				console.log('setting key', key, val, fullPath, keys);

				const [hasFlags, { noValidate, noFormUpdate }] = getFlags(val);
				const newVal = hasFlags ? val[1] : val;
				// TODO: this assignment triggers the store to call to .set with some circular magic that I need to figure out, run resetField on object test to understand
				newObj = cloneWithStoreReactivity(newVal, store, touched_store, dirty_store, [...fullPath]);

				if (!noFormUpdate) {
					dirty_store?.update((x) => setI(fullPath, assign(true, newObj), x));
					touched_store?.update((x) =>
						setI(fullPath, assignUsingLeft(false, newObj, getInternal(fullPath, x)!), x),
					);
				}
				if (store) store.set([fullPath, newVal, noValidate]);
			},
			enumerable: true,
		});
	}

	return res as T;
}
