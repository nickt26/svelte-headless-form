import { Writable } from 'svelte/store';
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

function hasNoValidateFlag(val: unknown): boolean {
	return Array.isArray(val) && val[0] === noValidate;
}

export const noValidate = Symbol('noValidate');
export const cloneWithStoreReactivity = <T>(
	obj: T,
	store: Writable<[Array<string | number | symbol>, unknown, boolean] | null> | null = null,
	path?: string | Array<string | number | symbol>,
): T => {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj))) {
		return obj;
	}

	if (obj instanceof Date) {
		const date = new Date();
		date.setTime(obj.getTime());
		return date as T;
	}

	if (Array.isArray(obj)) {
		let res = obj.map((val, i) => {
			const fullPath = path ? [...path, `${i}`] : [`${i}`];
			const shouldNotValidate = hasNoValidateFlag(val);
			const newVal = shouldNotValidate ? val[1] : val;
			return cloneWithStoreReactivity(newVal, store, fullPath);
		});
		res = new Proxy(res, {
			set(target, prop, val) {
				if (typeof prop === 'string' && !isNaN(parseInt(prop))) {
					const fullPath = path ? [...path, prop] : [prop];
					console.log('setting', fullPath, val);

					const shouldNotValidate = hasNoValidateFlag(val);

					const newVal = shouldNotValidate ? val[1] : val;
					target[parseInt(prop)] = cloneWithStoreReactivity(newVal, store, fullPath);
					if (store) store.set([fullPath, newVal, shouldNotValidate]);
					return true;
				}
				// @ts-ignore
				return Reflect.set(...arguments);
			},
		});
		return res as T;
	}

	const res = {};
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const fullPath = path ? [...path, key] : [key];
		let newObj = cloneWithStoreReactivity(obj[key], store, fullPath);

		Object.defineProperty(res, key, {
			get() {
				return newObj;
			},
			set(val) {
				console.log('setting key', key, val, fullPath, keys);

				const shouldNotValidate = hasNoValidateFlag(val);
				const newVal = shouldNotValidate ? val[1] : val;
				// TODO: this assignment triggers the store to call to .set with some circular magic that I need to figure out, run resetField on object test to understand
				newObj = cloneWithStoreReactivity(newVal, store, [...fullPath]);
				if (store) {
					store.set([fullPath, newVal, shouldNotValidate]);
				}
			},
			enumerable: true,
		});
	}

	return res as T;
};
