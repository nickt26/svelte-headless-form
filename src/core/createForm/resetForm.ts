import { Writable } from 'svelte/store';
import { assign } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import { DependencyFields, ErrorFields, FormState, ResetFormFn, ValidatorFields } from '../../types/Form';

export const createResetForm = <T extends object>(
	initialValues: T,
	initialValidators: ValidatorFields<T>,
	initialDeps: DependencyFields,
	values_store: Writable<T>,
	validators_store: Writable<ValidatorFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	deps_store: Writable<DependencyFields>,
	state_store: Writable<FormState>,
): ResetFormFn<object> => {
	return (options): void => {
		const newValues = options?.values === undefined ? clone(initialValues) : clone(options.values);
		const newValidators = options?.validators === undefined ? clone(initialValidators) : clone(options.validators);
		const newDeps =
			options?.deps === undefined
				? clone(initialDeps)
				: mergeRightDeepImpure(assign([], newValues), clone(options.deps));

		values_store.set(newValues as T);
		validators_store.set(newValidators as ValidatorFields<T>);
		errors_store.set(assign(false as string | false, newValues) as ErrorFields<T>);
		deps_store.set(newDeps);
		state_store.update((x) =>
			mergeRightDeepImpure(x, {
				isDirty: false,
				isTouched: false,
				hasErrors: false,
				submitCount: 0,
				resetCount: x.resetCount + 1,
			} satisfies Partial<FormState>),
		);
	};
};
