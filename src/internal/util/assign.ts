import { ObjectDeep } from '../../types/Form';
import { clone } from './clone';
import { empty } from './empty';
import { isObject } from './isObject';
import { setImpure } from './set';

export const assignImpure = <T, S extends object, K extends object>(
	val: T,
	objStructure: S,
	objectToAssignTo: K,
): K => {
	for (const key in objStructure) {
		const value = objStructure[key];

		if (isObject(value) || Array.isArray(value)) {
			Object.assign(objectToAssignTo, {
				[key]: assignImpure(val, value, empty(value)),
			});
			continue;
		}

		Object.assign(objectToAssignTo, {
			[key]: clone(val),
		});
	}
	return objectToAssignTo;
};

export const assign = <T, S extends object = object>(
	value: T,
	objStructure: S,
): ObjectDeep<S, T> => {
	const toReturn = empty(objStructure);
	if (isObject(objStructure))
		for (const key of Object.keys(objStructure)) {
			let val = objStructure[key];

			if (isObject(val) || Array.isArray(val)) {
				toReturn[key] = assign(value, val);
				continue;
			}

			toReturn[key] = clone(value);
		}
	else if (Array.isArray(objStructure))
		for (let i = 0; i < objStructure.length; i++) {
			let val = objStructure[i];

			if (isObject(val) || Array.isArray(val)) {
				toReturn[i] = assign(value, val);
				continue;
			}
			toReturn[i] = clone(value);
		}
	// for (const key in objStructure) {
	// 	let val = objStructure[key];

	// 	if (isObject(val) || Array.isArray(val)) {
	// 		Object.assign(toReturn, {
	// 			[key]: assign(value, val),
	// 		});
	// 		continue;
	// 	}
	// 	Object.assign(toReturn, {
	// 		[key]: clone(value),
	// 	});
	// }
	return toReturn as ObjectDeep<S, T>;
};

export function assignUsing<T extends object, S extends object>(
	left: T,
	right: S,
	exceptedValues?: {
		use?: symbol[];
		compare?: symbol[];
	},
	result: object = {},
	path: Array<string | number | symbol> = [],
): T & S {
	if ((!isObject(left) && !Array.isArray(left)) || (!isObject(right) && !Array.isArray(right)))
		return result as T & S;
	const keys = Array.isArray(right)
		? right
		: [...Object.keys(right), ...Object.getOwnPropertySymbols(right)];
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const leftVal = left[key];
		const rightVal = right[key];
		if (key in left) {
			if (
				(Array.isArray(leftVal) && Array.isArray(rightVal)) ||
				(isObject(leftVal) && isObject(rightVal))
			) {
				assignUsing(
					leftVal,
					rightVal,
					exceptedValues,
					result,
					path.length ? [...path, key] : [key],
				);
			} else if (typeof leftVal === typeof rightVal) {
				setImpure(path.length ? [...path, key] : [key], rightVal, result);
			}
			continue;
		}

		const usableKey = exceptedValues?.use?.find((x) => x === key);
		const comparableKey = exceptedValues?.compare?.find((x) => x === key);

		if (usableKey) {
			setImpure(path.length ? [...path, key] : [key], rightVal, result);
			continue;
		}

		if (comparableKey) {
			if (Array.isArray(rightVal) || isObject(rightVal)) {
				assignUsing(left, rightVal, exceptedValues, result, path.length ? [...path, key] : [key]);
			}
		}
	}

	return result as T & S;
}

export const assignWithReactivity = <T, S extends object = object>(
	value: T,
	objStructure: S,
): ObjectDeep<S, T> => {
	const toReturn = empty(objStructure);
	for (const key in objStructure) {
		let val = objStructure[key];

		if (isObject(val)) {
			let yes = assignWithReactivity(value, val);
			Object.defineProperty(toReturn, key, {
				get() {
					// console.log('getting key', key, yes);
					return yes;
				},
				set(newVal) {
					if (yes !== newVal) console.log('setting key', key, newVal);
					yes = newVal;
				},
				enumerable: true,
			});
			continue;
		} else if (Array.isArray(val)) {
			let yes = assignWithReactivity(value, val);
			yes = new Proxy(yes, {
				get(_, prop) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	// console.log('getting', prop, target[prop]);
					// }
					// @ts-ignore
					return Reflect.get(...arguments);
				},
				set(target, prop, val) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	console.log('setting', prop);
					// }
					// @ts-ignore
					return Reflect.set(...arguments);
				},
			});
			Object.defineProperty(toReturn, key, {
				get() {
					// console.log('getting key', key, yes);
					return yes;
				},
				set(newVal) {
					if (yes !== newVal) console.log('setting key', key, newVal);
					yes = newVal;
				},
				enumerable: true,
			});
			continue;
		}

		// if (isObject(val) || Array.isArray(val)) {
		// 	Object.assign(toReturn, {
		// 		[key]: assign(value, val),
		// 	});
		// 	continue;
		// }
		// Object.assign(toReturn, {
		// 	[key]: clone(value),
		// });

		let ahhh = clone(value);
		Object.defineProperty(toReturn, key, {
			get() {
				// console.log('getting key', key, ahhh);
				return ahhh;
			},
			set(newVal) {
				if (ahhh !== newVal) console.log('setting key', key, newVal);
				ahhh = newVal;
			},
			enumerable: true,
		});
	}
	return toReturn as ObjectDeep<S, T>;
};
