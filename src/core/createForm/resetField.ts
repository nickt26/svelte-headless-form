import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { assign, assignUsing, assignUsingLeft } from '../../internal/util/assign';
import { clone, noValidate } from '../../internal/util/clone';
import { getInternal, getInternalSafe } from '../../internal/util/get';
import { isObject } from '../../internal/util/isObject';
import { removePropertyImpure } from '../../internal/util/removeProperty';
import { setImpure } from '../../internal/util/set';
import {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	LatestFieldEvent,
	ResetFieldFn,
	ValidatorFields,
} from '../../types/Form';

export const createResetField = <TValues extends object>(
	initialValues: TValues,
	initialTouched: BooleanFields<TValues>,
	initialDirty: BooleanFields<TValues>,
	initialErrors: ErrorFields<TValues>,
	initialValidators: ValidatorFields<TValues>,
	initialDeps: DependencyFieldsInternal<TValues>,
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internalState: [InternalFormState<TValues>],
	values_store: Writable<TValues>,
	touched_store: Writable<BooleanFields<TValues>>,
	dirty_store: Writable<BooleanFields<TValues>>,
	errors_store: Writable<ErrorFields<TValues>>,
	validators_store: Writable<ValidatorFields<TValues>>,
	deps_store: Writable<DependencyFieldsInternal<TValues>>,
	checkFormForStateReset: () => void,
): ResetFieldFn<object> => {
	return (name, options): void => {
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
		const newDeps = clone(options?.deps) ?? clone(getInternal(name, initialDeps));
		const newValidator = clone(options?.validator) ?? clone(getInternal(name, initialValidators));
		const shouldValidate = options?.validate ?? false;
		const newValueWithNoValidateRule = shouldValidate ? newValue : [noValidate, newValue];

		if (isObject(newValue) || Array.isArray(newValue)) {
			if (newDeps) deps_store.update((x) => setImpure(name, newDeps, x));
			else deps_store.update((x) => removePropertyImpure(name, x));
			validators_store.update((x) => setImpure(name, newValidator, x));
			if (options?.keepTouched) {
				touched_store.update((x) =>
					setImpure(
						name,
						assignUsingLeft(
							false,
							getInternal(name, newValue)!,
							getInternal(name, internalState[0].touched)!,
						),
						x,
					),
				);
			} else touched_store.update((x) => setImpure(name, assign(false, newValue), x));

			if (options?.keepDirty) {
				dirty_store.update((x) =>
					setImpure(
						name,
						assignUsingLeft(
							false,
							getInternal(name, newValue)!,
							getInternal(name, internalState[0].dirty)!,
						),
						x,
					),
				);
			} else dirty_store.update((x) => setImpure(name, assign(false, newValue), x));

			if (options?.keepError) {
				const currentErr = getInternal<object>(name, internalState[0].errors);
				if (currentErr) {
					errors_store.update((x) =>
						setImpure(name, assignUsing(getInternal(name, newValue)!, currentErr), x),
					);
				}
			} else errors_store.update((x) => removePropertyImpure(name, x));
			values_store.update((x) => setImpure(name, newValueWithNoValidateRule, x));

			latest_field_event_store.set({ field: name, event: 'afterReset' });
			checkFormForStateReset();
			return;
		}

		// const newValidator = options?.validator ?? getInternal(name, initialValidators);
		// reset all the field values before setting the new value and triggering validation
		if (newDeps) deps_store.update((x) => setImpure(name, newDeps, x));
		else deps_store.update((x) => removePropertyImpure(name, x));
		validators_store.update((x) => setImpure(name, newValidator, x));
		if (!options?.keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!options?.keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!options?.keepError) errors_store.update((x) => removePropertyImpure(name, x));
		values_store.update((x) => setImpure(name, newValueWithNoValidateRule, x));

		latest_field_event_store.set({ field: name, event: 'afterReset' });
		checkFormForStateReset();
	};
};
