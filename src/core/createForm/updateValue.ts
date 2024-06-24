import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { getInternal } from '../../internal/util/get';
import { setImpure } from '../../internal/util/set';
import {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	FormState,
	LatestFieldEvent,
	ValidatorFields,
} from '../../types/Form';

export function createUpdateValue<T extends object>(
	internalState: [InternalFormState<T>],
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	values_store: Writable<T>,
	dirty_store: Writable<BooleanFields<T>>,
	touched_store: Writable<BooleanFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	validators_store: Writable<ValidatorFields<T>>,
	deps_store: Writable<DependencyFieldsInternal<T>>,
	state_store: Writable<FormState>,
	initialValidators: ValidatorFields<T>,
	initialDeps: DependencyFieldsInternal<T>,
	runValidation: (
		name: string | Array<string | number | symbol>,
		formState: [InternalFormState<T>],
	) => Promise<void>,
): (name: string | Array<string | number | symbol>, value: unknown) => Promise<void> {
	return async (name, incomingValue) => {
		const formState = internalState[0];

		latest_field_event_store.set({ field: name, event: 'beforeChange' });

		// const fieldTouched = getInternal<boolean>(name, formState.touched);
		// if (fieldTouched === undefined) return;

		// if (isObject(incomingValue) || Array.isArray(incomingValue)) {
		// 	const fieldValue = getInternal(name, formState.values);
		// 	if (!(isObject(fieldValue) || Array.isArray(fieldValue))) {
		// 		values_store.update((x) => setImpure(name, clone(incomingValue), x));
		// 		dirty_store.update((x) => setImpure(name, assign(true, incomingValue), x));
		// 		touched_store.update((x) => setImpure(name, assign(false, incomingValue), x));
		// 		errors_store.update((x) => setImpure(name, assign(false, incomingValue), x));

		// 		const initialFieldValidator = getInternal<ValidatorFn | ValidatorFields>(
		// 			name,
		// 			initialValidators,
		// 		);
		// 		if (isObject(initialFieldValidator) || Array.isArray(initialFieldValidator))
		// 			validators_store.update((x) =>
		// 				setImpure(
		// 					name,
		// 					mergeRightDeepImpure(assign(undefined, incomingValue), clone(initialFieldValidator), {
		// 						onlySameKeys: true,
		// 					}),
		// 					x,
		// 				),
		// 			);
		// 		else validators_store.update((x) => setImpure(name, assign(undefined, incomingValue), x));

		// 		const initialFieldDeps = getInternal<string[] | DependencyFieldsInternal>(
		// 			name,
		// 			initialDeps,
		// 		);
		// 		if (
		// 			isObject(initialFieldDeps) ||
		// 			(Array.isArray(initialFieldDeps) &&
		// 				initialFieldDeps.some((x) => isObject(x) || Array.isArray(x))) // TODO: this logic has a flaw in it that will make this if statement true for 2d array values
		// 		)
		// 			deps_store.update((x) =>
		// 				setImpure(
		// 					name,
		// 					mergeRightDeepImpure(assign([], initialFieldDeps), clone(initialFieldDeps), {
		// 						onlySameKeys: true,
		// 					}),
		// 					x,
		// 				),
		// 			);
		// 		else deps_store.update((x) => setImpure(name, assign([], incomingValue), x));
		// 	} else {
		// 		//TODO: Potentially move value changes to the end so that listeners can update their values after clean up has been done
		// 		values_store.update((x) => setImpure(name, clone(incomingValue), x));
		// 		dirty_store.update((x) => setImpure(name, assign(true, incomingValue), x));
		// 		touched_store.update((x) =>
		// 			setImpure(
		// 				name,
		// 				mergeRightDeepImpure(
		// 					assign(false, incomingValue),
		// 					getInternal<BooleanFields>(name, formState.touched)!,
		// 					{
		// 						onlySameKeys: true,
		// 					},
		// 				),
		// 				x,
		// 			),
		// 		);
		// 		errors_store.update((x) => setImpure(name, assign(false, incomingValue), x));
		// 		validators_store.update((x) =>
		// 			setImpure(
		// 				name,
		// 				mergeRightDeepImpure(
		// 					mergeRightDeepImpure(
		// 						assign(undefined, incomingValue),
		// 						clone(getInternal<ValidatorFields>(name, initialValidators)!),
		// 						{ onlySameKeys: true },
		// 					),
		// 					formState.validators,
		// 					{ onlySameKeys: true, noUndefinedMerges: true },
		// 				),
		// 				x,
		// 			),
		// 		);
		// 		deps_store.update((x) =>
		// 			setImpure(
		// 				name,
		// 				mergeRightDeepImpure(
		// 					mergeRightDeepImpure(
		// 						assign([], incomingValue),
		// 						clone(getInternal<DependencyFieldsInternal>(name, initialDeps))!,
		// 						{
		// 							onlySameKeys: true,
		// 						},
		// 					),
		// 					formState.deps,
		// 					{ onlySameKeys: true, noUndefinedMerges: true },
		// 				),
		// 				x,
		// 			),
		// 		);
		// 	}
		// } else {
		// 	const fieldValue = getInternal(name, formState.values);

		// 	if (isObject(fieldValue) || Array.isArray(fieldValue)) {
		// 		values_store.update((x) => setImpure(name, incomingValue, x));
		// 		dirty_store.update((x) => setImpure(name, true, x));
		// 		touched_store.update((x) => setImpure(name, false, x));
		// 		errors_store.update((x) => setImpure(name, false, x));

		// 		const initialFieldValidator = getInternal<ValidatorFn | ValidatorFields>(
		// 			name,
		// 			initialValidators,
		// 		);
		// 		if (!(isObject(initialFieldValidator) || Array.isArray(initialFieldValidator)))
		// 			validators_store.update((x) => setImpure(name, initialFieldValidator, x));
		// 		else validators_store.update((x) => setImpure(name, undefined, x));

		// 		const initialFieldDeps = getInternal<string[] | DependencyFieldsInternal>(
		// 			name,
		// 			initialDeps,
		// 		);
		// 		if (
		// 			!(
		// 				(
		// 					isObject(initialFieldDeps) ||
		// 					(Array.isArray(initialFieldDeps) &&
		// 						initialFieldDeps.some((x) => isObject(x) || Array.isArray(x)))
		// 				) // TODO: Will fail for 2d array values
		// 			)
		// 		)
		// 			deps_store.update((x) => setImpure(name, initialFieldDeps, x));
		// 		else deps_store.update((x) => setImpure(name, [], x));
		// 	} else {
		// values_store.update((x) => setImpure(name, incomingValue, x));

		const fieldIsDirty = getInternal(name, formState.dirty);

		if (!fieldIsDirty) dirty_store.update((x) => setImpure(name, true, x));
		// 	}
		// }

		if (!formState.state.isDirty) {
			state_store.update((x) => setImpure('isDirty', true, x));
		}
		if (formState.validateMode === 'onChange' || formState.validateMode === 'all') {
			await runValidation(name, internalState);
		}
		latest_field_event_store.set({ field: name, event: 'afterChange' });
	};
}
