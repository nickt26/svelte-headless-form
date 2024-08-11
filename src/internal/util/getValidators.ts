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
	let last = current[lastKey];

	const currentPath = [...splitPath];

	if (last === undefined) {
		if (isFunction(current[This])) validators.push([currentPath, current[This]]);
		if (isFunction(current[All])) validators.push([currentPath, current[All]]);
		if (Array.isArray(current[Values])) last = current[Values][lastKey];
	}

	if (isObject(last)) {
		if (isFunction(last[This])) validators.push([currentPath, last[This]]);

		// TODO: Double check if we need this isFunction(last[AllFields]) check if we don't care about child validators due to us using isFormValidSchemaless() on object/array updates
		// if (isFunction(last[AllFields]))
		// 	validators.push([[...currentPath, AllFields], last[AllFields]]);

		// for (const key of Object.keys(last)) getValidators(key, last, validators);
	}
	// else if (Array.isArray(last))
	// 	for (let i = 0; i < last.length; i++) validators.push([[...currentPath, i], last[i]]);
	else if (isFunction(last)) validators.push([currentPath, last]);

	return validators;
};

export const getValidatorss = (
	path: string | Array<string | number | symbol>,
	validatorObj: object,
	valueObj: object,
	validators: Array<[Array<string | number | symbol>, Function]> = [],
	carriedPath: Array<string | number | symbol> = [],
	allValidator?: Function,
): Array<[Array<string | number | symbol>, Function]> => {
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	let currentValidator: any = validatorObj;
	let currentValue: any = valueObj;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];

		if (
			isNil(currentValidator[key]) ||
			(!isObject(currentValidator[key]) && !Array.isArray(currentValidator[key]))
		)
			return [];

		if (isObject(currentValidator[key])) {
			if (isFunction(currentValidator[key][This]))
				validators.push([splitPath.slice(0, i + 1), currentValidator[key][This]]);

			if (isFunction(currentValidator[key][All]))
				validators.push([splitPath.slice(0, i + 2), currentValidator[key][All]]);

			if (currentValidator[key][Values]) {
				currentValidator = currentValidator[key][Values];
				currentValue = currentValue[key];
				continue;
			}
		}

		currentValidator = currentValidator[key];
		currentValue = currentValue[key];
	}
	const lastKey = splitPath[splitPath.length - 1];
	let lastValidator = currentValidator[lastKey] ?? currentValidator[Values]?.[lastKey];
	const lastValue = currentValue[lastKey];

	const currentPath = [...carriedPath, ...splitPath];

	// TODO: Add this undefined check, but make sure that you can't add the same validator and path multiple times
	// if (last === undefined) {
	// 	if (isFunction(current[This])) addValidator(currentPath, current[This], validators);
	// 	if (isFunction(current[All])) addValidator(currentPath, current[All], validators);
	// 	if (Array.isArray(current[Values])) last = current[Values][lastKey];
	// }

	// if (typeof lastValidator[All] === 'function' && !Array.isArray(lastValidator) && !)

	if (allValidator) validators.push([currentPath, allValidator]);
	if (isObject(lastValidator)) {
		if (isFunction(lastValidator[This])) validators.push([currentPath, lastValidator[This]]);

		// if (isFunction(lastValidator[All])) validators.push([[...currentPath, All], last[All]]);

		if (
			isFunction(lastValidator[All]) &&
			Array.isArray(lastValue) &&
			!Array.isArray(lastValidator[Values])
		)
			for (let i = 0; i < lastValue.length; i++)
				getValidatorss(
					`${i}`,
					lastValidator,
					lastValue,
					validators,
					currentPath,
					lastValidator[All],
				);
		if (Array.isArray(lastValidator[Values]))
			for (let i = 0; i < lastValidator[Values].length; i++)
				getValidatorss(
					`${i}`,
					lastValidator,
					lastValue,
					validators,
					currentPath,
					isFunction(lastValidator[All]) ? lastValidator[All] : undefined,
				);
		// else if (isFunction(lastValidator[All]) && Array.isArray(lastValue))
		// 	for (let i = 0; i < lastValue.length; i++)
		// 		getValidatorss(`${i}`, lastValidator, lastValue, validators, currentPath);

		const keys = Object.keys(lastValidator);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			getValidatorss(key, lastValidator, lastValue, validators, currentPath);
		}
	} else if (Array.isArray(lastValidator) && Array.isArray(lastValue))
		for (let i = 0; i < lastValue.length; i++)
			getValidatorss(`${i}`, lastValidator, lastValue, validators, currentPath);
	else if (isFunction(lastValidator)) validators.push([currentPath, lastValidator]);

	return validators;
};

function addValidator(
	path: Array<string | number | symbol>,
	validator: Function,
	validators: Array<[Array<string | number | symbol>, Function]>,
): void {
	const addValidator = !validators.some((validator) =>
		validator[0].every((key, i) => key === path[i]),
	);

	if (addValidator) validators.push([path, validator]);
}
