import { Writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { applyValidatorI } from '../../internal/util/applyValidators';
import { getInternal } from '../../internal/util/get';
import { getValidators } from '../../internal/util/getValidators';
import { isNil } from '../../internal/util/isNil';
import { isObject } from '../../internal/util/isObject';
import { isPromise } from '../../internal/util/isPromise';
import { mergeRightI } from '../../internal/util/mergeRightDeep';
import { setI } from '../../internal/util/set';
import { someDeep } from '../../internal/util/someDeep';
import { ErrorFields, FormState, LatestFieldEvent, ValidationResolver } from '../../types/Form';

export function createRunValidation<T extends Record<PropertyKey, unknown>>(
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internal_counter_store: Writable<InternalFormStateCounter>,
	errors_store: Writable<ErrorFields<T>>,
	state_store: Writable<FormState>,
	isSchemaless: boolean,
	isSchema: boolean,
	internalState: [InternalFormState<T>],
	validationResolver?: ValidationResolver<T>,
): (name: string | Array<PropertyKey>) => Promise<void> {
	async function runValidation(name: string | Array<PropertyKey>): Promise<void> {
		latest_field_event_store.set({ field: name, event: 'beforeValidate' });
		internal_counter_store.update((x) => setI('validations', x.validations + 1, x));

		const formState = internalState[0];
		try {
			const fieldValue = getInternal(name, formState.values);
			if (isSchemaless) {
				if (isObject(fieldValue) || Array.isArray(fieldValue)) {
					const validators = getValidators(name, formState.validators, formState.values);
					const errors = {};
					for (let i = 0; i < validators.length; i++) {
						const res = applyValidatorI(validators[i], formState.values, errors);
						if (isPromise(res)) await res;
					}

					errors_store.update((x) => setI(name, getInternal(name, errors), x));

					if (Object.keys(errors).length > 0 && !formState.state.hasErrors)
						state_store.update((x) => setI('hasErrors', true, x));
				} else {
					const validators = getValidators(name, formState.validators, formState.values);
					for (let i = 0; i < validators.length; i++) {
						const applyRes = applyValidatorI(validators[i], formState.values, formState.errors);
						const res = isPromise(applyRes) ? await applyRes : applyRes;

						if (typeof res === 'string' && !formState.state.hasErrors)
							state_store.update((x) => setI('hasErrors', true, x));
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
					errors_store.update((x) => mergeRightI(x, fieldError));
				else errors_store.update((x) => setI(name, fieldError, x));
			}
		} finally {
			internal_counter_store.update((x) => setI('validations', x.validations - 1, x));
			if (!someDeep((x) => typeof x === 'string', formState.errors) && formState.state.hasErrors)
				state_store.update((x) => setI('hasErrors', false, x));
			latest_field_event_store.set({ field: name, event: 'afterValidate' });
		}
	}

	return runValidation;
}
