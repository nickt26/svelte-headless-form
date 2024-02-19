import { Writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { getInternal, getTriggers } from '../../internal/util/get';
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
	TriggerObject,
	ValidationResolver,
	ValidatorFields,
	ValidatorFn,
} from '../../types/Form';

export function createRunValidation<T extends object>(
	latest_field_event_store: Writable<LatestFieldEvent>,
	internal_counter_store: Writable<InternalFormStateCounter>,
	errors_store: Writable<ErrorFields<T>>,
	state_store: Writable<FormState>,
	isSchemaless: boolean,
	isSchema: boolean,
	validationResolver?: ValidationResolver<T>,
): (name: string, internalState: [InternalFormState<T>]) => Promise<void> {
	return async (name, internalState) => {
		latest_field_event_store.set({ field: name, event: 'beforeValidate' });
		internal_counter_store.update((x) => setImpure('validations', x.validations + 1, x));
		const formState = internalState[0];
		try {
			const fieldValue = getInternal<T[keyof T] | object | null>(name, formState.values);
			if (isSchemaless) {
				const fieldValidator = getInternal<ValidatorFn<T> | ValidatorFields<T[keyof T] & object>>(
					name,
					formState.validators,
				);
				if (isObject(fieldValue) || Array.isArray(fieldValue)) {
					if (!(isObject(fieldValidator) || !Array.isArray(fieldValidator)))
						throw new Error(
							'Validator must be an object or array when value is an object or array',
						);

					const [_, errors] = await isFormValidSchemaless(
						fieldValue as object,
						fieldValidator as ValidatorFields,
						formState,
						getInternal(name, formState.deps),
						getTriggers<TriggerObject>(name, formState.triggers),
					);
					errors_store.update((x) => mergeRightDeepImpure(x, errors));

					if (Object.keys(errors).length > 0 && !formState.state.hasErrors)
						state_store.update((x) => setImpure('hasErrors', true, x));
				} else {
					if (fieldValidator) {
						if (isObject(fieldValidator) || Array.isArray(fieldValidator))
							throw new Error('Validator must be a function when value is a primitive or nullish');

						const validatorResult = await fieldValidator(fieldValue, formState);
						if (getInternal(name, formState.errors) !== validatorResult) {
							errors_store.update((x) => setImpure(name, validatorResult, x));
							if (!formState.state.hasErrors)
								state_store.update((x) => setImpure('hasErrors', true, x));
						}
					}
				}

				const triggers = getTriggers(name, formState.triggers);
				for (const trigger of (triggers as TriggerObject)?.triggers ??
					(triggers as string[]) ??
					[]) {
					const triggerValue = getInternal(trigger, formState.values);
					const triggerValidator = getInternal<ValidatorFn<T>>(trigger, formState.validators);

					if (isObject(triggerValidator) || Array.isArray(triggerValidator))
						throw new Error('Trigger validator cannot be an object or array');

					if (triggerValidator) {
						const triggerValidatorResult = await triggerValidator(triggerValue, formState);
						if (getInternal(trigger, formState.errors) !== triggerValidatorResult) {
							errors_store.update((x) => setImpure(trigger, triggerValidatorResult, x));
							if (!formState.state.hasErrors)
								state_store.update((x) => setImpure('hasErrors', true, x));
						}
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

				const triggers = getTriggers(name, formState.triggers);
				for (const trigger of (triggers as TriggerObject)?.triggers ?? (triggers as string[]) ?? [])
					errors_store.update((x) =>
						setImpure(trigger, getInternal<string | false>(trigger, formErrors) ?? false, x),
					);
			}
		} finally {
			internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));
			if (!someDeep((x) => typeof x === 'string', formState.errors) && formState.state.hasErrors)
				state_store.update((x) => setImpure('hasErrors', false, x));
			latest_field_event_store.set({ field: name, event: 'afterValidate' });
		}
	};
}