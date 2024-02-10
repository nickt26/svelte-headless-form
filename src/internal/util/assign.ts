import { ObjectDeep } from '../../types/Form';
import { clone } from './clone';
import { empty } from './empty';
import { isObject } from './isObject';

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
	for (const key in objStructure) {
		let val = objStructure[key];

		if (isObject(val)) {
			let yes = assign(value, val);
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
			let yes = assign(value, val);
			yes = new Proxy(yes, {
				get(_, prop) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	// console.log('getting', prop, target[prop]);
					// }
					return Reflect.get(...arguments);
				},
				set(target, prop, val) {
					// if (typeof prop === 'string' && !Number.isNaN(parseInt(prop))) {
					// 	console.log('setting', prop);
					// }
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
