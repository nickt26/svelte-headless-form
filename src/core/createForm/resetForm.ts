import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { assign, assignUsing } from '../../internal/util/assign';
import { clone, cloneWithStoreReactivity } from '../../internal/util/clone';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import {
	All,
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	FormState,
	ResetFormFn,
	This,
	ValidatorFields,
	Values,
} from '../../types/Form';

export const createResetForm = <T extends object>(
	initialValues: T,
	initialValidators: ValidatorFields<T>,
	initialDeps: DependencyFieldsInternal<T>,
	values_store: Writable<T>,
	validators_store: Writable<ValidatorFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	deps_store: Writable<DependencyFieldsInternal<T>>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	state_store: Writable<FormState>,
	internalState: [InternalFormState<T>],
	value_change_store: Writable<[Array<string | number | symbol>, unknown, boolean] | null> | null,
): ResetFormFn<T> => {
	return (options) => {
		const hasNewValues = !!options && 'values' in options;
		const newValues = hasNewValues
			? clone(mergeRightDeepImpure(clone(initialValues), options.values))
			: clone(initialValues);
		const reactiveNewValues = cloneWithStoreReactivity(
			newValues,
			value_change_store,
			touched_store,
			dirty_store,
		);

		values_store.set(reactiveNewValues);
		if (options?.keepValidators) {
			validators_store.set(
				assignUsing(
					newValues,
					mergeRightDeepImpure(internalState[0].validators, options?.validators),
					{
						use: [This, All],
						compare: [Values],
					},
				),
			);
		} else {
			validators_store.set(
				assignUsing(newValues, options?.validators ?? initialValidators, {
					use: [This, All],
					compare: [Values],
				}) as ValidatorFields<T>,
			);
		}
		if (options?.keepErrors) errors_store.set(assignUsing(newValues, internalState[0].errors));
		else errors_store.set({});

		if (options?.keepDeps)
			deps_store.set(
				assignUsing(newValues, mergeRightDeepImpure(internalState[0].deps, options?.deps)),
			);
		else deps_store.set(assignUsing(newValues, options?.deps ?? initialDeps));

		if (options?.keepTouched) touched_store.set(assignUsing(newValues, internalState[0].touched));
		else touched_store.set(assign(false, newValues));

		if (options?.keepDirty) dirty_store.set(assignUsing(newValues, internalState[0].dirty));
		else dirty_store.set(assign(false, newValues));

		state_store.update((x) =>
			mergeRightDeepImpure(x, {
				isDirty: options?.keepDirty,
				isTouched: options?.keepTouched,
				hasErrors: options?.keepErrors,
				submitCount: 0,
				resetCount: x.resetCount + 1,
			} satisfies Partial<FormState>),
		);
	};
};
