import { Writable } from 'svelte/store';
import { BooleanFields } from '../../types/Form';
import { assign, assignUsingLeft } from './assign';
import { getInternal } from './get';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setImpure } from './set';

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
export const cloneWithStoreReactivity = <T extends object>(
	obj: T,
	store: Writable<[Array<string | number | symbol>, unknown, boolean] | null> | null = null,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	path?: string | Array<string | number | symbol>,
): T => {
	if (!isObject(obj) && !Array.isArray(obj)) {
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
			const [hasFlags, { noValidate, noFormUpdate }] = getFlags(val);
			const newVal = hasFlags ? val[1] : val;
			return cloneWithStoreReactivity(newVal, store, touched_store, dirty_store, fullPath);
		});
		res = new Proxy(res, {
			set(target, prop, val, receiver) {
				if (typeof prop === 'string' && !isNaN(parseInt(prop))) {
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
						dirty_store.update((x) => setImpure(fullPath, assign(true, target[parseInt(prop)]), x));
						touched_store.update((x) =>
							setImpure(
								fullPath,
								assignUsingLeft(false, target[parseInt(prop)], getInternal(fullPath, x)!),
								x,
							),
						);
					}
					if (store) store.set([fullPath, newVal, noValidate]);

					return true;
				}
				// @ts-ignore
				return Reflect.set(target, prop, val, receiver);
			},
		});
		return res as T;
	}

	const res = {};
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const fullPath = path ? [...path, key] : [key];
		let newObj = cloneWithStoreReactivity(
			obj[key] as any,
			store,
			touched_store,
			dirty_store,
			fullPath,
		);

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
					dirty_store.update((x) => setImpure(fullPath, assign(true, newObj), x));
					touched_store.update((x) =>
						setImpure(fullPath, assignUsingLeft(false, newObj, getInternal(fullPath, x)!), x),
					);
				}
				if (store) store.set([fullPath, newVal, noValidate]);
			},
			enumerable: true,
		});
	}

	return res as T;
};
