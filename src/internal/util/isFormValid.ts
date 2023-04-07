import { ErrorFields, ValidatorFields } from '../../types/Form';
import { empty } from './empty';
import { isObject } from './isObject';

export function isFormValidImpure<T extends object, V extends object>(
	currentValue: V,
	values: T,
	currentValidator: ValidatorFields<V> | undefined,
	formValidity = true,
	errors = {} as ErrorFields<T>
): [boolean, ErrorFields<T>] {
	const currentValueKeys = Object.keys(currentValue);
	for (let i = 0; i < currentValueKeys.length; i++) {
		const key = currentValueKeys[i] as keyof V;
		const val = currentValue[key];
		const validateFn = currentValidator && currentValidator[key];
		if (validateFn && typeof validateFn === 'function') {
			const errResult = validateFn(val, values as any);
			Object.assign(errors, {
				[key]: errResult
			});
			if (errResult !== false) formValidity = false;
		}
		if (isObject(val) || Array.isArray(val)) {
			const [isValid, childErrors] = isFormValidImpure<T, typeof val>(
				val,
				values,
				validateFn as ValidatorFields<typeof val> | undefined,
				formValidity,
				empty(val) as ErrorFields<T>
			);
			formValidity = formValidity ? isValid : formValidity;
			Object.assign(errors, {
				[key]: childErrors
			});
		}
	}

	return [formValidity, errors];
}
