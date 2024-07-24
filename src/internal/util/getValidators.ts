import { All, This, Values } from '../../types/Form';
import { isFunction } from './isFunction';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getValidators = (
	path: string | Array<string | number | symbol>,
	obj: object,
): Array<[Array<string | number | symbol>, Function]> => {
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	const validators: Array<[Array<string | number | symbol>, Function]> = [];
	let current: any = obj;

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];

		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key]))) return [];

		if (isObject(current[key])) {
			if (isFunction(current[key][This]))
				validators.push([splitPath.slice(0, i + 1), current[key][This]]);

			if (isFunction(current[key][All]))
				validators.push([splitPath.slice(0, i + 2), current[key][All]]);

			if (current[key][Values]) {
				current = current[key][Values];
				continue;
			}
		}

		current = current[key];
	}
	const lastKey = splitPath[splitPath.length - 1];
	const last = current[lastKey];

	const currentPath = [...splitPath];
	if (isObject(last)) {
		if (isFunction(last[This])) validators.push([currentPath, last[This]]);

		// TODO: Double check if we need this isFunction(last[AllFields]) check if we don't care about child validators due to us using isFormValidSchemaless() on object/array updates
		// if (isFunction(last[AllFields]))
		// 	validators.push([[...currentPath, AllFields], last[AllFields]]);

		// for (const key of Object.keys(last)) getValidators(key, last, validators);
	}
	// else if (Array.isArray(last))
	// for (let i = 0; i < last.length; i++) getValidators(`${i}`, last, validators);
	else if (isFunction(last)) validators.push([currentPath, last]);

	return validators;
};
