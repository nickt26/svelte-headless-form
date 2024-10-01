import { All, This, Values } from '../../types/Form';
import { isFunction } from './isFunction';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getValidators = (
	path: string | Array<PropertyKey>,
	validatorObj: object,
	valueObj: object,
	validators: Array<[Array<PropertyKey>, Function]> = [],
	carriedPath: Array<PropertyKey> = [],
	allValidator?: Function,
): Array<[Array<PropertyKey>, Function]> => {
	const splitPath = path === '' ? [] : Array.isArray(path) ? path : path.split(/\./g);

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
	let lastValidator =
		splitPath.length === 0
			? currentValidator
			: currentValidator[lastKey] ?? currentValidator[Values]?.[lastKey];
	const lastValue = splitPath.length === 0 ? currentValue : currentValue[lastKey];

	const currentPath = [...carriedPath, ...splitPath];

	if (allValidator) validators.push([currentPath, allValidator]);
	if (isObject(lastValidator)) {
		if (isFunction(lastValidator[This])) validators.push([currentPath, lastValidator[This]]);

		if (
			isFunction(lastValidator[All]) &&
			Array.isArray(lastValue) &&
			!Array.isArray(lastValidator[Values])
		)
			for (let i = 0; i < lastValue.length; i++)
				getValidators(
					`${i}`,
					lastValidator,
					lastValue,
					validators,
					currentPath,
					lastValidator[All],
				);
		if (Array.isArray(lastValidator[Values]))
			for (let i = 0; i < lastValidator[Values].length; i++)
				getValidators(
					`${i}`,
					lastValidator,
					lastValue,
					validators,
					currentPath,
					isFunction(lastValidator[All]) ? lastValidator[All] : undefined,
				);

		const keys = Object.keys(lastValidator);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			getValidators(key, lastValidator, lastValue, validators, currentPath);
		}
	} else if (Array.isArray(lastValidator) && Array.isArray(lastValue))
		for (let i = 0; i < lastValue.length; i++)
			getValidators(`${i}`, lastValidator, lastValue, validators, currentPath);
	else if (isFunction(lastValidator)) validators.push([currentPath, lastValidator]);

	return validators;
};

function addValidator(
	path: Array<PropertyKey>,
	validator: Function,
	validators: Array<[Array<PropertyKey>, Function]>,
): void {
	const addValidator = !validators.some((validator) =>
		validator[0].every((key, i) => key === path[i]),
	);

	if (addValidator) validators.push([path, validator]);
}
