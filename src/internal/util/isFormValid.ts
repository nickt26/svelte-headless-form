import {
	PartialDeep,
	PartialErrorFields,
	ValidationResolver,
	ValidatorFields,
} from '../../types/Form';
import { applyValidatorI } from './applyValidators';
import { getValidators } from './getValidators';
import { isObject } from './isObject';
import { isPromise } from './isPromise';
import { setI } from './set';

export const isFormValidSchemaless = async <T extends Record<PropertyKey, unknown>>(
	allFormValues: T,
	allFormValidators: ValidatorFields<T>,
	currentFormValue: any,
	currentKey: string = '',
	errors:
		| PartialDeep<Record<PropertyKey, string | false>>
		| PartialDeep<(string | false)[]> = Array.isArray(allFormValues) ? [] : {},
	isFormValid: [boolean] = [true],
): Promise<[boolean, PartialErrorFields<T>]> => {
	if (!isObject(currentFormValue) && !Array.isArray(currentFormValue)) {
		const validators = getValidators(currentKey, allFormValidators, allFormValues);
		if (validators.length === 0) {
			setI(currentKey, false, errors);
			return [isFormValid[0], errors];
		}

		for (let i = 0; i < validators.length; i++) {
			const applyRes = applyValidatorI(validators[i], allFormValues, errors);
			const res = isPromise(applyRes) ? await applyRes : applyRes;
			if (isFormValid[0]) isFormValid[0] = !res;
		}
		return [isFormValid[0], errors];
	}

	const keys = Object.keys(currentFormValue);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const keyToPush = currentKey ? `${currentKey}.${key}` : key;

		const fieldVal = currentFormValue[key];
		await isFormValidSchemaless(
			allFormValues,
			allFormValidators,
			fieldVal,
			keyToPush,
			errors,
			isFormValid,
		);
	}

	return [isFormValid[0], errors];
};

export const isFormValidSchema = async <T extends object>(
	values: T,
	validationResolver: ValidationResolver<T>,
): Promise<[boolean, PartialErrorFields<T>]> => {
	const errors = await validationResolver(values);
	const formValidity = Object.keys(errors).length === 0;
	return [formValidity, errors];
};
