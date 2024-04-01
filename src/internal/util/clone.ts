import { Writable } from 'svelte/store';
import { empty } from './empty';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const clone = <T>(obj: T): T => {
	if (isNil(obj)) return obj;
	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}
	if (!isObject(obj) && !Array.isArray(obj)) return obj;

	if (Array.isArray(obj)) return obj.map(clone) as T;

	const toReturn: Record<string | number | symbol, unknown> = {};
	for (const key of Object.getOwnPropertySymbols(obj)) toReturn[key] = clone(obj[key]);
	for (const key of Object.keys(obj)) toReturn[key] = clone(obj[key]);

	return toReturn as T;
};

export const cloneWithStoreReactivity = <T>(
	obj: T,
	store: Writable<[Array<string | number | symbol>, unknown] | null> | null = null,
	path?: Array<string | number | symbol>,
): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) return obj;

	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}

	let toReturn = empty(obj);
	if (Array.isArray(toReturn)) {
		toReturn = new Proxy(toReturn, {
			// get(_, prop) {
			// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
			// console.log('getting', prop, target[prop]);
			// }
			// 	return Reflect.get(...arguments);
			// },
			set(target, prop, val) {
				if (typeof prop === 'string' && !isNaN(parseInt(prop))) {
					// if (path) path.push(prop);
					// else path = [prop];
					const fullPath = path ? [...path, prop] : [prop];
					console.log('setting', fullPath, val);

					target[parseInt(prop)] = cloneWithStoreReactivity(val, store, fullPath);
					if (store) store.set([fullPath, val]);
					return true;
				}
				// @ts-ignore
				return Reflect.set(...arguments);
			},
		});
	}

	for (const key of Object.keys(obj)) {
		const fullPath = path ? [...path, key] : [key];
		let newObj = cloneWithStoreReactivity(obj[key as keyof typeof obj], store, fullPath);

		if (isObject(toReturn)) {
			Object.defineProperty(toReturn, key, {
				get() {
					// console.log('getting key', key, newObj);
					return newObj;
				},
				set(newVal) {
					// const fullPath = path ? [...path, key] : [key];
					console.log('setting key', key, newVal, fullPath);
					newObj = cloneWithStoreReactivity(newVal, store, fullPath);
					if (store) store.set([fullPath, newVal]);
				},
				enumerable: true,
			});
		} else if (Array.isArray(toReturn)) {
			Object.assign(toReturn, {
				[key]: newObj,
			});
		}
	}

	return toReturn as T;
};
