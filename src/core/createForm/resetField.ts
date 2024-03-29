import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { assign } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import { getInternal, getTriggers } from '../../internal/util/get';
import { isObject } from '../../internal/util/isObject';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import { setImpure } from '../../internal/util/set';
import {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	LatestFieldEvent,
	PartialDeep,
	ResetFieldFn,
	ValidatorFields,
} from '../../types/Form';

export const createResetField = <T extends object>(
	initialValues: T,
	initialTouched: BooleanFields<T>,
	initialDirty: BooleanFields<T>,
	initialErrors: ErrorFields<T>,
	initialValidators: ValidatorFields<T>,
	initialDeps: DependencyFieldsInternal<T>,
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	internalState: [InternalFormState<T>],
	values_store: Writable<T>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	validators_store: Writable<ValidatorFields<T>>,
	deps_store: Writable<DependencyFieldsInternal<T>>,
	checkFormForStateReset: () => void,
): ResetFieldFn<object> => {
	return (name, options): void => {
		if (typeof name !== 'string') throw new Error('The name argument must be a string.');
		latest_field_event_store.set({ field: name, event: 'beforeReset' });

		const formStateInternal = internalState[0];
		const fieldValue = getInternal(name, formStateInternal.values);

		if (isObject(fieldValue) || Array.isArray(fieldValue)) {
			const initialValue = getInternal<object>(name, initialValues);
			const optionValueExists = options?.value !== undefined;

			if (
				initialValue === undefined &&
				!(isObject(initialValue) || Array.isArray(initialValue)) &&
				options?.value === undefined
			)
				throw new Error(
					`There is no initial value for the field: ${name}. To fix this error you must provide a value in the options object.`,
				);

			const newValue = !options?.value ? clone(initialValue) : (clone(options.value) as object);

			if (!options?.keepValue) values_store.update((x) => setImpure(name, newValue, x));
			if (!options?.keepTouched) {
				const newTouched = optionValueExists
					? assign(false, newValue)
					: clone(getInternal<BooleanFields>(name, initialTouched));
				touched_store.update((x) => setImpure(name, newTouched, x));
			}
			if (!options?.keepDirty) {
				const newDirty = optionValueExists
					? assign(false, newValue)
					: clone(getInternal<BooleanFields>(name, initialDirty));
				dirty_store.update((x) => setImpure(name, newDirty, x));
			}
			if (!options?.keepError) {
				const newErrors = optionValueExists
					? assign(false, newValue)
					: clone(getInternal<ErrorFields>(name, initialErrors));
				errors_store.update((x) => setImpure(name, newErrors, x));
			}
			if (!options?.keepValidator) {
				const initialValidator = getInternal<object>(name, initialValidators);
				const validatorExistsInInitial = initialValidator !== undefined;
				const optionValidatorExists = options?.validator !== undefined;
				const newValidator = optionValidatorExists
					? clone(options.validator)
					: validatorExistsInInitial
					? clone(initialValidator)
					: assign(undefined, newValue);
				validators_store.update((x) => setImpure(name, newValidator, x));
			}
			if (!options?.keepDeps) {
				const initialDep = getInternal<object>(name, initialDeps);
				const depExistsInInitial = initialDep !== undefined;
				const optionDepExists = options?.deps !== undefined;
				const newDeps = optionDepExists
					? clone(options.deps)
					: depExistsInInitial
					? clone(initialDep)
					: assign([], newValue);
				deps_store.update((x) => setImpure(name, newDeps, x));
			}
			if (!options?.keepDependentErrors) {
				const triggers = getTriggers(name, formStateInternal.triggers) ?? [];
				const errors = {} as PartialDeep<T, string | false>;

				if (triggers) for (const trigger of triggers) setImpure(trigger, false, errors);
				errors_store.update((x) => mergeRightDeepImpure(x, errors));
			}
			checkFormForStateReset();
			latest_field_event_store.set({ field: name, event: 'afterReset' });
			return;
		}
		if (!options?.keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!options?.keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!options?.keepValue) {
			const newValue =
				options?.value !== undefined ? options.value : getInternal(name, initialValues);
			values_store.update((x) => setImpure(name, newValue, x));
		}
		if (!options?.keepValidator) {
			const newValidator =
				options?.deps !== undefined ? options.validator : getInternal<string[]>(name, initialDeps);
			validators_store.update((x) => setImpure(name, newValidator, x));
		}
		if (!options?.keepError) errors_store.update((x) => setImpure(name, false, x));

		if (!options?.keepDeps) {
			const newDeps =
				options?.deps !== undefined ? options.deps : getInternal<string[]>(name, initialDeps);
			deps_store.update((x) => setImpure(name, newDeps, x));
		}
		if (!options?.keepDependentErrors) {
			const triggers = getTriggers(name, formStateInternal.triggers) ?? [];
			const errors = {} as PartialDeep<T, string | false>;

			if (triggers) for (const trigger of triggers) setImpure(trigger, false, errors);
			errors_store.update((x) => mergeRightDeepImpure(x, errors));
		}
		latest_field_event_store.set({ field: name, event: 'afterReset' });
		checkFormForStateReset();
	};
};
