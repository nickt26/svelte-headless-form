import { onDestroy } from 'svelte';
import { Writable } from 'svelte/store';
import { InternalFormState } from '../internal/types/Form';
import { assign } from '../internal/util/assign';
import { clone } from '../internal/util/clone';
import { getInternal } from '../internal/util/get';
import { isObject } from '../internal/util/isObject';
import { setImpure } from '../internal/util/set';
import {
	DependencyFields,
	DependencyFieldsInternal,
	Form,
	FormControl,
	FormOptions,
	HandlerFn,
	ReadonlyDeep,
	UpdateValueFn,
	UseFieldArrayFn,
	ValidateFn,
} from '../types/Form';
import { createCheckFormForStateReset } from './createForm/checkFormForStateReset';
import { createStores } from './createForm/createStores';
import { createUseFieldArray } from './createForm/createUseFieldArray';
import { createHandleBlur } from './createForm/handleBlur';
import { createHandleFocus } from './createForm/handleFocus';
import { handleSubscriptions } from './createForm/handleSubscriptions';
import { createInitialValues } from './createForm/initialValues';
import { createResetField } from './createForm/resetField';
import { createResetForm } from './createForm/resetForm';
import { createRunValidation } from './createForm/runValidation';
import { createSubmitForm } from './createForm/submitForm';
import { createUpdateValue } from './createForm/updateValue';

export function createForm<T extends object = object>(formOptions: FormOptions<T>): Form<T> {
	const isSchemaless = 'initialValidators' in formOptions;
	const isSchema = 'validationResolver' in formOptions;
	const validateMode =
		formOptions.validateMode ?? (isSchemaless ? 'onChange' : isSchema ? 'onBlur' : 'none');

	const {
		initialValues,
		initialDirty,
		initialTouched,
		initialDeps,
		initialErrors,
		initialState,
		initialValidators,
		validationResolver,
	} = createInitialValues(
		formOptions.initialValues,
		isSchemaless,
		isSchema,
		(formOptions as any).initialValidators,
		(formOptions as any).validationResolver,
		formOptions.initialDeps as DependencyFieldsInternal<T>,
	);

	const {
		touched_store,
		dirty_store,
		values_store,
		validators_store,
		errors_store,
		deps_store,
		state_store,
		validate_mode_store,
		internal_counter_store,
		latest_field_event_store,
		internal_state_store,
		value_change_store,
	} = createStores(
		initialTouched,
		initialDirty,
		initialValues,
		initialValidators,
		initialErrors,
		initialDeps,
		initialState,
		validateMode,
	);

	handleSubscriptions(internal_counter_store, state_store);

	const internalState: [InternalFormState<T>] = [null] as any;
	const internalStateUnsub = internal_state_store.subscribe((x) => (internalState[0] = x));

	const runValidation = createRunValidation(
		latest_field_event_store,
		internal_counter_store,
		errors_store,
		state_store,
		isSchemaless,
		isSchema,
		validationResolver,
	);

	const updateValue = createUpdateValue(
		internalState,
		latest_field_event_store,
		values_store,
		dirty_store,
		touched_store,
		errors_store,
		validators_store,
		deps_store,
		state_store,
		initialValidators,
		initialDeps,
		runValidation,
	);

	// const should_validate_store = writable<{ id: number; value: boolean } | undefined>();

	// let prevShouldValidate = false;
	// const run_validation_store = derived(
	// 	[should_validate_store, value_change_store],
	// 	([$shouldValidate, $valueChange]) => {
	// 		console.log('value change detected', $valueChange?.[0], $valueChange?.[1], $shouldValidate);
	// 		if (prevShouldValidate !== $shouldValidate || (!prevShouldValidate && !$shouldValidate)) {
	// 			prevShouldValidate = $shouldValidate; // prevent validation from running when shouldValidate changes;
	// 			return;
	// 		}

	// 		if ($valueChange && $shouldValidate) updateValue($valueChange[0], $valueChange[1]);
	// 	},
	// );

	// const runValidationUnsub = run_validation_store.subscribe(() => {
	// 	console.log('run validation');
	// });

	const valueChangeUnsub = value_change_store.subscribe((val) => {
		console.log('value change detected', val?.[0], val?.[1]);

		const shouldValidate = val && !val[2];
		if (shouldValidate) {
			updateValue(val[0], val[1]);
		}
	});

	onDestroy(() => {
		internalStateUnsub();
		// runValidationUnsub();
		valueChangeUnsub();
	});

	const submitForm = createSubmitForm(
		internalState,
		state_store,
		internal_counter_store,
		isSchemaless,
		isSchema,
		validationResolver,
		touched_store,
		errors_store,
	);

	const resetForm = createResetForm(
		initialValues,
		initialValidators,
		initialDeps,
		values_store,
		validators_store,
		errors_store,
		deps_store,
		state_store,
	);

	const checkFormForStateReset = createCheckFormForStateReset(internalState, state_store);

	const resetField = createResetField(
		initialValues,
		initialTouched,
		initialDirty,
		initialErrors,
		initialValidators,
		initialDeps,
		latest_field_event_store,
		internalState,
		values_store,
		touched_store,
		dirty_store,
		errors_store,
		validators_store,
		deps_store,
		checkFormForStateReset,
	);

	const useFieldArray = createUseFieldArray(
		values_store,
		touched_store,
		dirty_store,
		validators_store,
		errors_store,
		deps_store,
		internalState,
		checkFormForStateReset,
		runValidation,
	);

	const handleBlur = createHandleBlur(
		internalState,
		latest_field_event_store,
		touched_store,
		state_store,
		runValidation,
	);

	const handleFocus = createHandleFocus(latest_field_event_store, internalState, runValidation);

	const validate = (name: string) => runValidation(name, internalState);

	const clean: Form['clean'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return dirty_store.update((x) => setImpure(path, assign(false, val), x));
		}
		return dirty_store.update((x) => setImpure(path, false, x));
	};

	const makeDirty: Form['makeDirty'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return dirty_store.update((x) => setImpure(path, assign(true, val), x));
		}
		return dirty_store.update((x) => setImpure(path, true, x));
	};

	const unBlur: Form['unBlur'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return touched_store.update((x) => setImpure(path, assign(false, val), x));
		}
		return touched_store.update((x) => setImpure(path, false, x));
	};

	// type BatchType = {
	// 	id: number;
	// 	values: Array<string>;
	// };

	// type BatchValueType = {
	// 	id: number;
	// 	values: Array<{ path: string; value: unknown }>;
	// };
	// const batch_value_store = writable<BatchValueType | undefined>();
	// const batch_touched_store = writable<BatchType | undefined>();
	// const batch_untouch_store = writable<BatchType | undefined>();
	// const batch_dirty_store = writable<BatchType | undefined>();
	// const batch_clean_store = writable<BatchType | undefined>();
	// const batch_validator_store = writable<BatchType | undefined>();
	// const batch_deps_store = writable<BatchType | undefined>();
	// const batch_errors_store = writable<BatchType | undefined>();
	// const batch_counter_store = writable<number>(0);

	// const applyValueBatch = (batch: BatchValueType) => {
	// 	values_store.update((x) => {
	// 		for (const { path, value } of batch.values) {
	// 			setImpure(path, value, x);
	// 		}
	// 		return x;
	// 	});
	// };

	// const applyTouchedBatch = (batch: BatchType) => {
	// 	touched_store.update((x) => {
	// 		for (const path of batch.values) {
	// 			const val = getInternal(path, x);
	// 			if (isObject(val) || Array.isArray(val)) {
	// 				setImpure(path, assign(true, val), x);
	// 			} else {
	// 				setImpure(path, true, x);
	// 			}
	// 		}
	// 		return x;
	// 	});
	// };

	// const resolveTouchedBatches = (
	// 	touchedBatch: BatchType,
	// 	untouchBatch: BatchType,
	// 	valuesBatch: BatchValueType,
	// ) => {
	// 	return {
	// 		touched: {
	// 			id: touchedBatch.id,
	// 			values: touchedBatch.values.filter(
	// 				(x) => !touchedBatch.values.includes(x) && !untouchBatch.values.includes(x) && valuesBatch.values.some(y => y.),
	// 			),
	// 		},
	// 		untouch: {
	// 			id: untouchBatch.id,
	// 			values: untouchBatch.values.filter(
	// 				(x) => !untouchBatch.values.includes(x) && !touchedBatch.values.includes(x),
	// 			),
	// 		},
	// 	};
	// };

	// const applyUntouchBatch = (batch: BatchType) => {};

	// const applyDirtyBatch = (batch: BatchType) => {
	// 	dirty_store.update((x) => {
	// 		for (const path of batch.values) {
	// 			const val = getInternal(path, x);
	// 			if (isObject(val) || Array.isArray(val)) {
	// 				setImpure(path, assign(true, val), x);
	// 			} else {
	// 				setImpure(path, true, x);
	// 			}
	// 		}
	// 		return x;
	// 	});
	// };

	//TODO: Potentially add an object to this tuple and make all references to the counter use .value so that reference updates carry through to uses of the counter
	// Alternatively, just use [0] everywhere instead of turning into a variable like so: const batchCount = batch_counter[0];
	// let batch_counter: [number] = [0];
	// const batchCounterUnsub = batch_counter_store.subscribe((x) => {
	// 	batch_counter[0] = x;
	// });

	// const batch = async (fn: (options: FormControl<T>) => void | Promise<void>) => {
	// 	batch_counter_store.update((x) => x + 1);
	// const options: FormControl<T> = {

	// };
	// 	await fn({} as any);
	// 	batch_counter_store.update((x) => x - 1);
	// };

	const control: FormControl<T> = {
		touched: {
			subscribe: touched_store.subscribe,
		},
		values: {
			subscribe: values_store.subscribe,
			set: values_store.set,
			update: values_store.update,
		},
		dirty: {
			subscribe: dirty_store.subscribe,
		},
		validators: validators_store,
		errors: {
			subscribe: errors_store.subscribe,
		},
		deps: deps_store as Writable<DependencyFields<T>>,
		state: {
			subscribe: state_store.subscribe,
		},
		validateMode: validate_mode_store,
		handleBlur: handleBlur as HandlerFn<T>,
		handleFocus: handleFocus as HandlerFn<T>,
		updateValue: updateValue as UpdateValueFn<T>,
		useFieldArray: useFieldArray as UseFieldArrayFn<T>,
		submitForm,
		resetForm,
		resetField,
		initialValues: clone(initialValues) as ReadonlyDeep<T>,
		initialValidators: clone(initialValidators),
		initialDeps: clone(initialDeps) as DependencyFields<T>,
		validate: validate as ValidateFn<T>,
		latestFieldEvent: {
			subscribe: latest_field_event_store.subscribe,
		},
		clean,
		makeDirty,
		unBlur,
	};
	return {
		control,
		...control,
	};
}
