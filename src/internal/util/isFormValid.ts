import {
	BooleanFields,
	DependencyFieldsInternal,
	PartialErrorFields,
	TriggerFields,
	ValidationResolver,
	ValidatorFields,
	ValidatorState,
} from '../../types/Form';
import { getInternal } from './get';
import { getTriggers } from './getTriggers';
import { isFunction } from './isFunction';
import { isObject } from './isObject';
import { setImpure } from './set';

export const isFormValidSchemaless = async <T extends object>(
	allFormValues: T,
	allFormValidators: ValidatorFields<T>,
	allFormDeps: DependencyFieldsInternal<T>,
	allFormTriggers: TriggerFields<T>,
	allFormTouched: BooleanFields<T>,
	allFormDirty: BooleanFields<T>,
	currentFormValue: any,
	currentFormValidator: any | undefined,
	currentFormDep: any | undefined,
	errors: any = {},
	currentKey = '',
	isFormValid: [boolean] = [true],
	validatedFields: Set<string> = new Set(),
): Promise<[boolean, PartialErrorFields<object> | string | boolean]> => {
	if (!isObject(currentFormValue) && !Array.isArray(currentFormValue)) {
		if (validatedFields.has(currentKey)) return [isFormValid[0], errors];
		if (currentFormDep?.length > 0) return [isFormValid[0], errors];

		const validator = currentFormValidator;
		if (
			isFunction(validator)
			// !isNil(validator) &&
			// !isObject(validator) &&
			// !Array.isArray(validator) &&
			// typeof validator === 'function'
		) {
			const validatorResult = (await validator(currentFormValue, {
				values: allFormValues,
				dirty: allFormDirty,
				errors,
				touched: allFormTouched,
				path: currentKey,
			} satisfies ValidatorState<T>)) as string | false;

			setImpure(currentKey, validatorResult, errors);
			if (isFormValid[0]) isFormValid[0] = !validatorResult;
			return [isFormValid[0], errors];
		}

		setImpure(currentKey, false, errors);
		validatedFields.add(currentKey);
		return [isFormValid[0], errors];
	}

	for (const key of Object.keys(currentFormValue)) {
		const keyToPush = currentKey ? `${currentKey}.${key}` : key;
		if (validatedFields.has(keyToPush)) continue;
		if (currentFormDep?.[key]?.length > 0) continue;

		const fieldVal = currentFormValue[key as any];

		const fieldTriggers = getTriggers(keyToPush, allFormTriggers, allFormValues, false);

		for (const triggerPath of fieldTriggers)
			await isFormValidSchemaless(
				allFormValues,
				allFormValidators,
				allFormDeps,
				allFormTriggers,
				allFormTouched,
				allFormDirty,
				getInternal(triggerPath, allFormValues),
				getInternal(triggerPath, allFormValidators),
				getInternal(triggerPath, allFormDeps),
				// undefined,
				errors,
				triggerPath,
				isFormValid,
				validatedFields,
			);

		await isFormValidSchemaless(
			allFormValues,
			allFormValidators,
			allFormDeps,
			allFormTriggers,
			allFormTouched,
			allFormDirty,
			fieldVal,
			getInternal(keyToPush, allFormValidators),
			getInternal(keyToPush, allFormDeps),
			// getTriggers(keyToPush, allFormTriggers, allFormValues),
			errors,
			keyToPush,
			isFormValid,
			validatedFields,
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
