import { Writable } from 'svelte/store';
import { empty } from './empty';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const clone = <T>(
	obj: T,
	store: Writable<[string, unknown] | null> | null = null,
	path?: string,
): T => {
	if (isNil(obj)) return obj;
	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}
	if (!isObject(obj) && !Array.isArray(obj)) return obj;

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
					const fullPath = path ? `${path}.${prop}` : `${prop}`;
					console.log('setting', fullPath, val);

					target[parseInt(prop)] = clone(val, store, fullPath);
					if (store) store.set([fullPath, val]);
					return true;
				}
				// @ts-ignore
				return Reflect.set(...arguments);
			},
		});
	}

	for (const key in obj) {
		// Object.assign(toReturn, {
		// 	[key]: clone(obj[key]),
		// });
		const fullPath = path ? `${path}.${key}` : `${key}`;
		let newObj = clone(obj[key], store, fullPath);

		if (isObject(toReturn)) {
			Object.defineProperty(toReturn, key, {
				get() {
					// console.log('getting key', key, newObj);
					return newObj;
				},
				set(newVal) {
					console.log('setting key', key, newVal);
					newObj = clone(newVal, store, fullPath);
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
