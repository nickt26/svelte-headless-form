import { AllFields, CurrentObject, Values } from '../../types/Form';
import { isFunction } from './isFunction';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getValidators = (
	path: string | Array<string | number | symbol>,
	obj: object,
	validators: Array<[Array<string | number | symbol>, Function]> = [],
): Array<[Array<string | number | symbol>, Function]> => {
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);
	let current: any = obj;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key]))) return [];

		if (isObject(current[key])) {
			if (isFunction(current[key][CurrentObject]))
				validators.push([splitPath.slice(0, i + 1), current[key][CurrentObject]]);

			if (isFunction(current[key][AllFields]))
				validators.push([splitPath.slice(0, i + 2), current[key][AllFields]]);

			if (current[key][Values]) {
				current[key] = current[key][Values];
				continue;
			}
		}

		current = current[key];
	}
	const lastKey = splitPath[splitPath.length - 1];
	const last = current[lastKey];
	const currentPath = splitPath.slice(0, splitPath.length - 1);
	if (isObject(last)) {
		if (isFunction(last[CurrentObject])) validators.push([currentPath, last[CurrentObject]]);

		// TODO: Double check if we need this isFunction(last[AllFields]) check if we don't care about child validators due to us using isFormValidSchemaless() on object/array updates
		// if (isFunction(last[AllFields]))
		// 	validators.push([[...currentPath, AllFields], last[AllFields]]);

		// for (const key of Object.keys(last)) getValidators(key, last, validators);
	}
	// else if (Array.isArray(last))
	// for (let i = 0; i < last.length; i++) getValidators(`${i}`, last, validators);
	else if (isFunction(last)) validators.push(last);

	return validators;
};
