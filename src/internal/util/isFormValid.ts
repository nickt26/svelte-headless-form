import { PartialFormObject, ValidationResolver, ValidatorFields } from '../../types/Form';
import { empty } from './empty';
import { isObject } from './isObject';

export const isFormValidSchemaless = async <T extends object, V extends object>(
	currentValue: V,
	values: T,
	currentValidator: ValidatorFields<V> | undefined,
	formValidity = true,
	errors = {} as PartialFormObject<T, string | false>
): Promise<[boolean, PartialFormObject<T, string | false>]> => {
	const currentValueKeys = Object.keys(currentValue);
	for (let i = 0; i < currentValueKeys.length; i++) {
		const key = currentValueKeys[i] as keyof V;
		const val = currentValue[key];
		const validateFn = currentValidator && currentValidator[key];
		if (validateFn && (typeof validateFn === 'function' || validateFn instanceof Promise)) {
			// @ts-ignore
			const errResult = await validateFn(val, values as any);
			Object.assign(errors, {
				[key]: errResult
			});
			if (errResult !== false) formValidity = false;
		}
		if (isObject(val) || Array.isArray(val)) {
			const [isValid, childErrors] = await isFormValidSchemaless<T, typeof val>(
				val,
				values,
				validateFn as ValidatorFields<typeof val> | undefined,
				formValidity,
				empty(val) as PartialFormObject<T, string | false>
			);
			formValidity = formValidity ? isValid : formValidity;
			Object.assign(errors, {
				[key]: childErrors
			});
		}
	}

	return [formValidity, errors];
};

export const isFormValidSchema = async <T extends object>(
	values: T,
	validationResolver: ValidationResolver<T>
): Promise<[boolean, PartialFormObject<T, string | false>]> => {
	const errors = await validationResolver(values);
	const formValidity = Object.keys(errors).length === 0;
	return [formValidity, errors];
};
