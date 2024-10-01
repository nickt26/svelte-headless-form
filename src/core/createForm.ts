import { onDestroy } from 'svelte';
import { InternalFormState } from '../internal/types/Form';
import { assign } from '../internal/util/assign';
import { clone } from '../internal/util/clone';
import { getInternal } from '../internal/util/get';
import { isObject } from '../internal/util/isObject';
import { setI } from '../internal/util/set';
import {
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

export function createForm<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>(
	formOptions: FormOptions<T>,
): Form<T> {
	const isSchemaless = 'initialValidators' in formOptions;
	const isSchema = 'validationResolver' in formOptions;
	const validateMode =
		formOptions.validateMode ?? (isSchemaless ? 'onChange' : isSchema ? 'onBlur' : 'none');

	const {
		initialValues,
		initialDirty,
		initialTouched,
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
	);

	const {
		touched_store,
		dirty_store,
		values_store,
		validators_store,
		errors_store,
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
		internalState,
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
		state_store,
		initialValidators,
		runValidation,
	);

	const valueChangeUnsub = value_change_store.subscribe((val) => {
		console.log('value change detected', val?.[0], val?.[1]);

		const shouldValidate = val && !val[2];
		if (shouldValidate) updateValue(val[0], val[1]);
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
		values_store,
		validators_store,
		errors_store,
		touched_store,
		dirty_store,
		state_store,
		internalState,
		value_change_store,
	);

	const checkFormForStateReset = createCheckFormForStateReset(internalState, state_store);

	const resetField = createResetField(
		initialValues,
		initialTouched,
		initialDirty,
		initialErrors,
		initialValidators,
		latest_field_event_store,
		internalState,
		values_store,
		touched_store,
		dirty_store,
		errors_store,
		validators_store,
		checkFormForStateReset,
		runValidation,
	);

	const useFieldArray = createUseFieldArray(
		values_store,
		touched_store,
		dirty_store,
		validators_store,
		errors_store,
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

	const validate = runValidation;

	const clean: ReturnType<typeof createForm>['clean'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return dirty_store.update((x) => setI(path, assign(false, val), x));
		}
		return dirty_store.update((x) => setI(path, false, x));
	};

	const makeDirty: Form['makeDirty'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return dirty_store.update((x) => setI(path, assign(true, val), x));
		}
		return dirty_store.update((x) => setI(path, true, x));
	};

	const unBlur: Form['unBlur'] = (path) => {
		const val = getInternal(path, internalState[0].values);
		if (isObject(val) || Array.isArray(val)) {
			return touched_store.update((x) => setI(path, assign(false, val), x));
		}
		return touched_store.update((x) => setI(path, false, x));
	};

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
		initialTouched: clone(initialTouched),
		initialDirty: clone(initialDirty),
		initialErrors: clone(initialErrors),
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
