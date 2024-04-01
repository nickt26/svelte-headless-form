import { onDestroy } from 'svelte';
import { Writable, get } from 'svelte/store';
import { InternalFormState } from '../internal/types/Form';
import { clone } from '../internal/util/clone';
import {
	DependencyFields,
	DependencyFieldsInternal,
	Form,
	FormControl,
	FormOptions,
	HandlerFn,
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

	console.log('touched store', get(touched_store));

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

	const valueChangeUnsub = value_change_store.subscribe((val) => {
		console.log('value change detected', val[0], val[1]);

		if (val) updateValue(val[0], val[1]);
	});

	onDestroy(() => {
		internalStateUnsub();
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
		initialValues: clone(initialValues),
		initialValidators: clone(initialValidators),
		initialDeps: clone(initialDeps) as DependencyFields<T>,
		validate: validate as ValidateFn<T>,
		latestFieldEvent: {
			subscribe: latest_field_event_store.subscribe,
		},
	};
	return {
		control,
		...control,
	};
}
