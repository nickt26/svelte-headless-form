import { ObjectDeep } from '../../types/Form';
import { clone } from './clone';
import { empty } from './empty';
import { isObject } from './isObject';
import { setI } from './set';

export const assignI = <T, S extends object, K extends object>(
	val: T,
	objStructure: S,
	objectToAssignTo: K,
): K => {
	const keys = Object.keys(objStructure);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const value = objStructure[key];

		if (isObject(value) || Array.isArray(value)) {
			Object.assign(objectToAssignTo, {
				[key]: assignI(val, value, empty(value)),
			});
			continue;
		}

		Object.assign(objectToAssignTo, {
			[key]: clone(val),
		});
	}
	return objectToAssignTo;
};

export const assign = <T, S>(value: T, objStructure: S): ObjectDeep<S, T> => {
	if (!isObject(objStructure) && !Array.isArray(objStructure)) {
		return value as ReturnType<typeof assign<T, S>>;
	}

	const toReturn = Array.isArray(objStructure) ? [] : {};
	if (isObject(objStructure)) {
		const keys = Object.keys(objStructure);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const val = objStructure[key];

			if (isObject(val) || Array.isArray(val)) {
				toReturn[key] = assign(value, val);
				continue;
			}

			toReturn[key] = clone(value);
		}
	} else if (Array.isArray(objStructure)) {
		for (let i = 0; i < objStructure.length; i++) {
			const val = objStructure[i];

			if (isObject(val) || Array.isArray(val)) {
				toReturn[i] = assign(value, val);
				continue;
			}
			toReturn[i] = clone(value);
		}
	}
	return toReturn as ReturnType<typeof assign<T, S>>;
};

export function assignUsing<T extends object, S extends object>(
	left: T,
	right: S,
	exceptedValues?: {
		use?: symbol[];
		compare?: symbol[];
	},
	result: object = Array.isArray(right) ? [] : {},
	path: Array<PropertyKey> = [],
): T & S {
	if ((!isObject(left) && !Array.isArray(left)) || (!isObject(right) && !Array.isArray(right))) {
		return result as T & S;
	}
	const keys = [...Object.keys(right), ...Object.getOwnPropertySymbols(right)];
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
			} else {
				setI(path.length ? [...path, key] : [key], rightVal, result);
			}
			continue;
		}

		const usableKey = exceptedValues?.use?.find((x) => x === key);
		const comparableKey = exceptedValues?.compare?.find((x) => x === key);

		if (usableKey) {
			setI(path.length ? [...path, key] : [key], rightVal, result);
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
		const val = objStructure[key];

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
				get(...args) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	// console.log('getting', prop, target[prop]);
					// }
					return Reflect.get(...args);
				},
				set(...args) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	console.log('setting', prop);
					// }
					return Reflect.set(...args);
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

export function assignUsingLeft<T, S>(
	value: unknown,
	left: T,
	right: S,
	toReturn: object = Array.isArray(left) ? [] : {},
	path: Array<PropertyKey> = [],
): object {
	if (!isObject(left) && !Array.isArray(left) && !isObject(right) && !Array.isArray(right)) {
		return right as object;
	}

	if ((!isObject(left) && !Array.isArray(left)) || (!isObject(right) && !Array.isArray(right))) {
		return toReturn;
	}

	const keys = Object.keys(left);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const leftVal = left[key];
		const rightVal = right[key];
		if (key in right) {
			if (
				(Array.isArray(leftVal) && Array.isArray(rightVal)) ||
				(isObject(leftVal) && isObject(rightVal))
			) {
				assignUsingLeft(value, leftVal, rightVal, toReturn, path.length ? [...path, key] : [key]);
			} else {
				setI(path.length ? [...path, key] : [key], rightVal, toReturn);
			}
			continue;
		} else {
			if (
				(Array.isArray(leftVal) && Array.isArray(rightVal)) ||
				(isObject(leftVal) && isObject(rightVal))
			) {
				assignUsingLeft(value, leftVal, rightVal, toReturn, path.length ? [...path, key] : [key]);
			} else {
				setI(path.length ? [...path, key] : [key], value, toReturn);
			}
		}

		setI(path.length ? [...path, key] : [key], value, toReturn);
	}
	return toReturn;
}
