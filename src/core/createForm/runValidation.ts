import { Writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { applyValidatorImpure } from '../../internal/util/applyValidators';
import { getInternal } from '../../internal/util/get';
import { getValidators } from '../../internal/util/getValidators';
import { isFormValidSchemaless } from '../../internal/util/isFormValid';
import { isNil } from '../../internal/util/isNil';
import { isObject } from '../../internal/util/isObject';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import { setImpure } from '../../internal/util/set';
import { someDeep } from '../../internal/util/someDeep';
import {
	ErrorFields,
	FormState,
	LatestFieldEvent,
	PartialErrorFields,
	ValidationResolver,
} from '../../types/Form';

export function createRunValidation<T extends object>(
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internal_counter_store: Writable<InternalFormStateCounter>,
	errors_store: Writable<ErrorFields<T>>,
	state_store: Writable<FormState>,
	isSchemaless: boolean,
	isSchema: boolean,
	internalState: [InternalFormState<T>],
	validationResolver?: ValidationResolver<T>,
): (name: string | Array<string | number | symbol>) => Promise<void> {
	async function runValidation(name: string | Array<string | number | symbol>): Promise<void> {
		latest_field_event_store.set({ field: name, event: 'beforeValidate' });
		internal_counter_store.update((x) => setImpure('validations', x.validations + 1, x));

		const formState = internalState[0];
		try {
			const fieldValue = getInternal(name, formState.values);
			if (isSchemaless) {
				if (isObject(fieldValue) || Array.isArray(fieldValue)) {
					// if (!isObject(fieldValidator) && !Array.isArray(fieldValidator)) {
					// 	throw new Error(
					// 		`Validator must be an object or array when value is an object or array for field: ${name}`,
					// 	);
					// }

					const fieldValidator = getInternal(name, formState.validators);
					const [_, errors] = await isFormValidSchemaless(
						fieldValue,
						fieldValidator as any,
						getInternal(name, formState.touched)! as any,
						getInternal(name, formState.dirty)! as any,
						fieldValue,
						fieldValidator,
					);
					errors_store.update((x) => setImpure(name, errors as PartialErrorFields<T>, x));

					if (Object.keys(errors).length > 0 && !formState.state.hasErrors)
						state_store.update((x) => setImpure('hasErrors', true, x));
				} else {
					// if (isObject(fieldValidator) || Array.isArray(fieldValidator)) {
					// 	throw new Error(
					// 		`Validator must be a function when value is a primitive or nullish for field: ${name}`,
					// 	);
					// }

					const validators = getValidators(name, formState.validators);
					for (let i = 0; i < validators.length; i++) {
						const res = await applyValidatorImpure(
							validators[i],
							formState.values,
							formState.errors,
						);

						if (typeof res === 'string' && !formState.state.hasErrors)
							state_store.update((x) => setImpure('hasErrors', true, x));
					}
				}
			}

			if (isSchema) {
				const formErrors = await validationResolver!(formState.values);
				if (isNil(formErrors))
					throw new Error('Cannot return null or undefined from validation resolver'); //illegal form state
				const fieldError =
					getInternal<string | false | ErrorFields<T[keyof T] & object>>(name, formErrors) ??
					(isObject(fieldValue) || Array.isArray(fieldValue) ? {} : false);

				if (isObject(fieldError) || Array.isArray(fieldError))
					errors_store.update((x) => mergeRightDeepImpure(x, fieldError));
				else errors_store.update((x) => setImpure(name, fieldError, x));
			}
		} finally {
			internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));
			if (!someDeep((x) => typeof x === 'string', formState.errors) && formState.state.hasErrors)
				state_store.update((x) => setImpure('hasErrors', false, x));
			latest_field_event_store.set({ field: name, event: 'afterValidate' });
		}
	}

	return runValidation;
}
