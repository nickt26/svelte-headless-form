import { Writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { getInternal } from '../../internal/util/get';
import { getTriggerField } from '../../internal/util/getTriggerField';
import { getTriggers } from '../../internal/util/getTriggers';
import { getValidators } from '../../internal/util/getValidators';
import { isFormValidSchemaless } from '../../internal/util/isFormValid';
import { isFunction } from '../../internal/util/isFunction';
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
	ValidatorFn,
} from '../../types/Form';

export function createRunValidation<T extends object>(
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internal_counter_store: Writable<InternalFormStateCounter>,
	errors_store: Writable<ErrorFields<T>>,
	state_store: Writable<FormState>,
	isSchemaless: boolean,
	isSchema: boolean,
	validationResolver?: ValidationResolver<T>,
): (
	name: string | Array<string | number | symbol>,
	internalState: [InternalFormState<T>],
) => Promise<void> {
	return async (name, internalState) => {
		latest_field_event_store.set({ field: name, event: 'beforeValidate' });
		internal_counter_store.update((x) => setImpure('validations', x.validations + 1, x));

		const formState = internalState[0];
		try {
			const fieldValue = getInternal(name, formState.values);
			if (isSchemaless) {
				const fieldValidator = getInternal<ValidatorFn<T>>(name, formState.validators);
				if (isObject(fieldValue) || Array.isArray(fieldValue)) {
					if (!isObject(fieldValidator) && !Array.isArray(fieldValidator))
						throw new Error(
							`Validator must be an object or array when value is an object or array for field: ${name}`,
						);

					const fieldDeps = getInternal(name, formState.deps);
					const [_, errors] = await isFormValidSchemaless(
						fieldValue,
						fieldValidator as any,
						fieldDeps as any,
						getTriggerField(name, formState.triggers) as any,
						getInternal(name, formState.touched),
						getInternal(name, formState.dirty),
						fieldValue,
						fieldValidator,
						fieldDeps,
					);
					errors_store.update((x) => mergeRightDeepImpure(x, errors as PartialErrorFields<T>));

					if (Object.keys(errors).length > 0 && !formState.state.hasErrors)
						state_store.update((x) => setImpure('hasErrors', true, x));
				} else if (fieldValidator) {
					if (isObject(fieldValidator) || Array.isArray(fieldValidator))
						throw new Error(
							`Validator must be a function when value is a primitive or nullish for field: ${name}`,
						);
					console.log('running single field validation', name);

					const validatorResult = await fieldValidator(fieldValue, {
						...formState,
						path: Array.isArray(name) ? name.join('.') : name,
					});
					if (getInternal(name, formState.errors) !== validatorResult) {
						errors_store.update((x) => setImpure(name, validatorResult, x));
						if (!formState.state.hasErrors)
							state_store.update((x) => setImpure('hasErrors', true, x));
					}
				}

				const triggers = getTriggers(name, formState.triggers, formState.values);
				for (const triggerName of triggers) {
					const triggerValue = getInternal(triggerName, formState.values);
					const triggerValidators = getValidators(triggerName, formState.validators);

					for (const triggerValidator of triggerValidators) {
						const path = triggerValidator[0];
						const validator = triggerValidator[1];
						console.log(path, validator);
						if (isFunction(validator)) {
							const triggerValidatorResult = await validator(triggerValue, {
								...formState,
								path,
							});
							if (getInternal(path, formState.errors) !== triggerValidatorResult) {
								errors_store.update((x) => setImpure(path, triggerValidatorResult, x));
								if (!formState.state.hasErrors)
									state_store.update((x) => setImpure('hasErrors', true, x));
							}
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

				const triggers = getTriggers(name, formState.triggers, formState.values);
				for (const trigger of triggers)
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
