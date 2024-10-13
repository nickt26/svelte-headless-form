import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { assign, assignUsing, assignUsingWith } from '../../internal/util/assign';
import { clone, noFormUpdate, noValidate } from '../../internal/util/clone';
import { getInternal, getInternalSafe } from '../../internal/util/get';
import { isObject } from '../../internal/util/isObject';
import { removePropertyI } from '../../internal/util/removeProperty';
import { setI } from '../../internal/util/set';
import {
	BooleanFields,
	ErrorFields,
	LatestFieldEvent,
	PartialValidatorFields,
	ResetFieldFn,
	ValidatorFields,
} from '../../types/Form';

export const createResetField = <T extends Record<PropertyKey, unknown>>(
	initialValues: T,
	initialTouched: BooleanFields<T>,
	initialDirty: BooleanFields<T>,
	initialErrors: ErrorFields<T>,
	initialValidators: ValidatorFields<T>,
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internalState: [InternalFormState<T>],
	values_store: Writable<T>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	validators_store: Writable<PartialValidatorFields<T>>,
	checkFormForStateReset: () => void,
	validate: (name: string | Array<PropertyKey>) => Promise<void>,
): ResetFieldFn<T> => {
	return async (name, options): Promise<void> => {
		if (typeof name !== 'string')
			throw new Error('resetField: The `name` argument must be a string');

		if (options) {
			if (!isObject(options))
				throw new Error('resetField: The `options` argument must be an object');

			if ('validate' in options && 'keepError' in options)
				throw new Error('resetField: You cannot use `validate` and `keepError` options together');
		}

		latest_field_event_store.set({ field: name, event: 'beforeReset' });

		const initialValue = getInternalSafe(name, initialValues);
		if (initialValue instanceof Error) {
			throw new Error(
				`resetField: There is no initial value for the field: ${name}. To fix this error you must provide a value in the options object.`,
			);
		}

		const hasNewValue = options && 'value' in options;
		const newValue = hasNewValue ? clone(options.value) : clone(initialValue);
		const newValidator = clone(options?.validator) ?? clone(getInternal(name, initialValidators));
		const shouldValidate = options?.validate ?? false;
		const newValueWithFlags = [{ [noValidate]: !shouldValidate, [noFormUpdate]: true }, newValue];

		if (isObject(newValue) || Array.isArray(newValue)) {
			validators_store.update((x) => setI(name, newValidator, x));
			if (options?.keepTouched) {
				touched_store.update((x) =>
					setI(name, assignUsingWith(false, getInternal(name, x)!, newValue), x),
				);
			} else touched_store.update((x) => setI(name, assign(false, newValue), x));

			if (options?.keepDirty) {
				dirty_store.update((x) =>
					setI(name, assignUsingWith(false, getInternal(name, x)!, newValue), x),
				);
			} else dirty_store.update((x) => setI(name, assign(false, newValue), x));

			values_store.update((x) => setI(name, newValueWithFlags, x));
			if (options?.keepError) {
				const currentErr = getInternal<Record<PropertyKey, unknown> | any[]>(
					name,
					internalState[0].errors,
				);
				if (currentErr) {
					errors_store.update((x) => setI(name, assignUsing(newValue, currentErr), x));
				}
			} else if (options?.validate && newValidator) {
				await validate(name);
				// errors_store.update((x) => removePropertyImpure(name, x));
			} else {
				errors_store.update((x) => removePropertyI(name, x));
			}

			latest_field_event_store.set({ field: name, event: 'afterReset' });
			checkFormForStateReset();
			return;
		}

		// const newValidator = options?.validator ?? getInternal(name, initialValidators);
		// reset all the field values before setting the new value and triggering validation
		validators_store.update((x) => setI(name, newValidator, x));
		if (!options?.keepTouched) touched_store.update((x) => setI(name, false, x));
		else touched_store.update((x) => setI(name, getInternal(name, x), x));
		if (!options?.keepDirty) dirty_store.update((x) => setI(name, false, x));
		values_store.update((x) => setI(name, newValueWithFlags, x));
		if (!options?.keepError) errors_store.update((x) => removePropertyI(name, x));
		if (options?.validate) await validate(name);

		latest_field_event_store.set({ field: name, event: 'afterReset' });
		checkFormForStateReset();
	};
};
