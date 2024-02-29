import { PartialErrorFields } from '../../types/Form';
import { getInternal, getTriggers } from './get';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setImpure } from './set';

export const isFormValidSchemaless = async (
	allFormValues: any,
	allFormValidators: any,
	allFormDeps: any,
	allFormTriggers: any,
	allFormTouched: any,
	allFormDirty: any,
	currentFormValue: any,
	currentFormValidator: any | undefined,
	currentFormDep: any | undefined,
	errors: any = {},
	currentKey = '',
	isFormValid: [boolean] = [true],
	validatedFields: string[] = [],
): Promise<[boolean, PartialErrorFields<object> | string | boolean]> => {
	if (!isObject(currentFormValue) && !Array.isArray(currentFormValue)) {
		if (validatedFields.includes(currentKey)) return [isFormValid[0], errors];
		if (currentFormDep?.length > 0) return [isFormValid[0], errors];

		const validator = currentFormValidator;
		if (
			!isNil(validator) &&
			!isObject(validator) &&
			!Array.isArray(validator) &&
			typeof validator === 'function'
		) {
			const validatorResult = (await validator(currentFormValue, {
				values: allFormValues,
				touched: allFormTouched,
				dirty: allFormDirty,
				errors,
			})) as string | false;

			setImpure(currentKey, validatorResult, errors);
			if (isFormValid[0]) isFormValid[0] = !validatorResult;
			return [isFormValid[0], errors];
		}

		setImpure(currentKey, false, errors);
		validatedFields.push(currentKey);
		return [isFormValid[0], errors];
	}

	for (const key of Object.keys(currentFormValue)) {
		const keyToPush = currentKey ? `${currentKey}.${key}` : key;
		if (validatedFields.includes(keyToPush)) continue;
		if (currentFormDep?.[key]?.length > 0) continue;

		const fieldVal = currentFormValue[key as any];

		const fieldTriggers = getTriggers(keyToPush, allFormTriggers);
		const fieldMustTrigger = !isNil(fieldTriggers);

		if (fieldMustTrigger) {
			for (const triggerPath of fieldTriggers) {
				await isFormValidSchemaless(
					allFormValues,
					allFormValidators,
					allFormDeps,
					allFormTriggers,
					allFormTouched,
					allFormDirty,
					getInternal(triggerPath, allFormValues),
					getInternal(triggerPath, allFormValidators),
					undefined,
					errors,
					triggerPath,
					isFormValid,
					validatedFields,
				);
			}
		}

		await isFormValidSchemaless(
			allFormValues,
			allFormValidators,
			allFormDeps,
			allFormTriggers,
			allFormTouched,
			allFormDirty,
			fieldVal,
			getInternal(keyToPush, allFormValidators),
			getTriggers(keyToPush, allFormDeps),
			errors,
			keyToPush,
			isFormValid,
			validatedFields,
		);
	}

	return [isFormValid[0], errors];
};
