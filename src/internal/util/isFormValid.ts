import {
	BooleanFields,
	PartialErrorFields,
	ValidationResolver,
	ValidatorFields,
} from '../../types/Form';
import { applyValidatorImpure } from './applyValidators';
import { getInternal } from './get';
import { getValidators } from './getValidators';
import { isObject } from './isObject';
import { setImpure } from './set';

export const isFormValidSchemaless = async <T extends object>(
	allFormValues: T,
	allFormValidators: ValidatorFields<T>,
	allFormTouched: BooleanFields<T>,
	allFormDirty: BooleanFields<T>,
	currentFormValue: any,
	currentFormValidators: any,
	currentKey: string = '',
	errors: object = Array.isArray(allFormValues) ? [] : {},
	isFormValid: [boolean] = [true],
): Promise<[boolean, PartialErrorFields<object> | string | boolean]> => {
	if (!isObject(currentFormValue) && !Array.isArray(currentFormValue)) {
		const validators = getValidators(currentKey, currentFormValidators);
		if (validators.length === 0) {
			setImpure(currentKey, false, errors);
			return [isFormValid[0], errors];
		}

		for (let i = 0; i < validators.length; i++) {
			const res = await applyValidatorImpure(validators[i], allFormValues, errors);
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
			allFormTouched,
			allFormDirty,
			fieldVal,
			getInternal(key, currentFormValidators),
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
