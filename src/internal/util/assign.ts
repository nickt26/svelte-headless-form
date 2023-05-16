import { FormObject } from '../../types/Form';
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

export const assign = <T, S extends object = object>(value: T, objStructure: S): FormObject<S, T> => {
	const toReturn = empty(objStructure) as FormObject<S, T>;
	for (const key in objStructure) {
		const val = objStructure[key];

		if (isObject(val) || Array.isArray(val)) {
			Object.assign(toReturn, {
				[key]: assign(value, val),
			});
			continue;
		}

		Object.assign(toReturn, {
			[key]: clone(value),
		});
	}
	return toReturn;
};
