import { onDestroy } from 'svelte';
import { derived, get, writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../internal/types/Form';
import { appendImpure } from '../internal/util/append';
import { assign, assignImpure } from '../internal/util/assign';
import { clone } from '../internal/util/clone';
import { findTriggers } from '../internal/util/findTriggers';
import { getInternal } from '../internal/util/get';
import { isFormValidSchema, isFormValidSchemaless } from '../internal/util/isFormValid';
import { isNil } from '../internal/util/isNil';
import { isObject } from '../internal/util/isObject';
import { mergeRightDeepImpure } from '../internal/util/mergeRightDeep';
import { prependImpure } from '../internal/util/prepend';
import { removePropertyImpure } from '../internal/util/removeProperty';
import { setImpure } from '../internal/util/set';
import {
	AsyncValidatorFn,
	BooleanFields,
	DependencyFields,
	ErrorFields,
	Field,
	Form,
	FormControl,
	FormOptions,
	FormState,
	PartialErrorFields,
	PartialFormObject,
	RegisterFn,
	ResetFieldFn,
	ResetFormFn,
	SubmitFormFn,
	UseFieldArrayFn,
	ValidateMode,
	ValidatorFields,
	ValidatorFn,
} from '../types/Form';

export const createForm = <T extends object>(formOptions: FormOptions<T>): Form<T> => {
	const isSchemaless = 'initialValidators' in formOptions;
	const isSchema = 'validationResolver' in formOptions;
	const validateMode = formOptions.validateMode ?? (isSchemaless ? 'onChange' : isSchema ? 'onBlur' : 'none');
	const initialTouched = assign(false, formOptions.initialValues);
	const initialDirty = assign(false, formOptions.initialValues);
	const initialPristine = assign(true, formOptions.initialValues);
	const initialValidators = isSchemaless
		? mergeRightDeepImpure(assign(undefined, formOptions.initialValues), formOptions.initialValidators!)
		: ({} as ValidatorFields<T>);
	const validationResolver = isSchema ? formOptions.validationResolver : undefined;
	const initialErrors = assign(false as string | false, formOptions.initialValues);
	const initialDeps = mergeRightDeepImpure(
		assign([] as string[], formOptions.initialValues),
		formOptions.initialDeps ?? {},
	);
	const initialValues = clone(formOptions.initialValues);
	const initialState: FormState = {
		isSubmitting: false,
		isPristine: true,
		isDirty: false,
		isTouched: false,
		isValidating: false,
		submitCount: 0,
		resetCount: 0,
	};

	let defaultValues = clone(initialValues); // Used to track all default values that may be added by useFieldArray methods
	let defaultValidators = clone(initialValidators); // Used to track all default validators that may be added by useFieldArray methods
	let defaultDeps = clone(initialDeps); // Used to track all default deps that may be added by useFieldArray methods

	const touched_store = writable<BooleanFields<T>>(clone(initialTouched));
	const dirty_store = writable<BooleanFields<T>>(clone(initialDirty));
	const pristine_store = writable<BooleanFields<T>>(clone(initialPristine));
	const values_store = writable<T>(clone(initialValues));
	const validators_store = writable<ValidatorFields<T>>(clone(initialValidators));
	const errors_store = writable<ErrorFields<T>>(clone(initialErrors));
	const deps_store = writable<DependencyFields<T>>(clone(initialDeps));
	const state_store = writable<FormState>(clone(initialState));
	const validate_mode_store = writable<ValidateMode>(validateMode);

	const internal_counter_store = writable<InternalFormStateCounter>({
		validations: 0,
		submits: 0,
	});
	const internal_state_store = derived(
		[
			values_store,
			touched_store,
			dirty_store,
			pristine_store,
			validators_store,
			errors_store,
			deps_store,
			state_store,
			validate_mode_store,
		],
		([$values, $touched, $dirty, $pristine, $validators, $errors, $deps, $state, $validateMode]) =>
			({
				values: $values,
				touched: $touched,
				dirty: $dirty,
				pristine: $pristine,
				validators: $validators,
				errors: $errors,
				deps: $deps,
				state: $state,
				validateMode: $validateMode,
			} as InternalFormState<T>),
	);

	const counterUnsub = internal_counter_store.subscribe((x) => {
		x.validations > 0
			? state_store.update((x) => setImpure('isValidating', true, x))
			: state_store.update((x) => setImpure('isValidating', false, x));

		x.submits > 0
			? state_store.update((x) => setImpure('isSubmitting', true, x))
			: state_store.update((x) => setImpure('isSubmitting', false, x));
	});

	onDestroy(() => counterUnsub());

	const isFormValid = async (formState: InternalFormState<T>): Promise<[boolean, PartialErrorFields<T>]> => {
		try {
			if (isSchemaless)
				return await isFormValidSchemaless(formState.values, formState.values, formState.validators, formState);
			if (isSchema) return await isFormValidSchema(formState.values, validationResolver!);
			return [true, {}];
		} catch (_) {
			return [false, {}];
		}
	};

	const submitForm: SubmitFormFn<T> = (submitFn, errorFn) => {
		return () =>
			(async () => {
				const formState = get(internal_state_store);
				state_store.update((x) => setImpure('submitCount', x.submitCount + 1, x));
				internal_counter_store.update((x) =>
					mergeRightDeepImpure(x, { validations: x.validations + 1, submits: x.submits + 1 }),
				);
				const [isValid, errors] = await isFormValid(formState);
				internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));
				if (isValid) {
					//prettier-ignore
					try { await submitFn(formState.values); } finally { internal_counter_store.update((x) => setImpure('submits', x.submits - 1, x)); }
				} else {
					touched_store.update((x) => assignImpure(true, x, x));
					errors_store.update((x) => mergeRightDeepImpure(x, errors));
					//prettier-ignore
					try { if (errorFn) await errorFn(get(errors_store)); } finally { internal_counter_store.update((x) => setImpure('submits', x.submits - 1, x)); }
				}
			})();
	};

	const resetForm: ResetFormFn<T> = (resetValues = {}, options) => {
		defaultValues = mergeRightDeepImpure(clone(initialValues), resetValues, options);
		defaultValidators = mergeRightDeepImpure(
			clone(initialValidators),
			mergeRightDeepImpure(assign(undefined, resetValues), defaultValidators, {
				replaceArrays: options?.replaceArrays,
				onlySameKeys: true,
			}),
			options,
		);
		defaultDeps = mergeRightDeepImpure(
			clone(initialDeps),
			mergeRightDeepImpure(assign([] as string[], resetValues), defaultDeps, {
				replaceArrays: options?.replaceArrays,
				onlySameKeys: true,
			}),
			options,
		);
		touched_store.set(assign(false, defaultValues));
		dirty_store.set(assign(false, defaultValues));
		pristine_store.set(assign(true, defaultValues));
		values_store.set(clone(defaultValues));
		validators_store.set(clone(defaultValidators));
		errors_store.set(assign(false as string | false, defaultValues));
		deps_store.set(clone(defaultDeps));
		state_store.update((x) =>
			mergeRightDeepImpure(x, {
				isDirty: false,
				isPristine: true,
				isTouched: false,
				resetCount: x.resetCount + 1,
			} satisfies PartialFormObject<FormState>),
		);
	};

	const resetField: ResetFieldFn = (name, resetFieldOptions) => {
		const value = getInternal(name, defaultValues);
		if (isObject(value) || Array.isArray(value)) {
			const existsInInitial = getInternal(name, initialValues) !== undefined;
			const valuesObject = clone(value);
			const touchedObject = existsInInitial
				? clone(getInternal<object>(name, initialTouched)!)
				: assign(false, valuesObject);
			const dirtyObject = existsInInitial
				? clone(getInternal<object>(name, initialDirty)!)
				: assign(false, valuesObject);
			const pristineObject = existsInInitial
				? clone(getInternal<object>(name, initialPristine)!)
				: assign(true, valuesObject);
			const validatorsObject = existsInInitial
				? clone(getInternal<object>(name, initialValidators)!)
				: clone(getInternal<object>(name, defaultValidators)!);
			const errorsObject = existsInInitial
				? clone(getInternal<object>(name, initialErrors)!)
				: assign(false as string | false, value);
			const depsObject = existsInInitial
				? clone(getInternal<object>(name, initialDeps)!)
				: clone(getInternal<object>(name, defaultDeps)!);
			touched_store.update((x) => setImpure(name, touchedObject, x));
			dirty_store.update((x) => setImpure(name, dirtyObject, x));
			pristine_store.update((x) => setImpure(name, pristineObject, x));
			values_store.update((x) => setImpure(name, valuesObject, x));
			validators_store.update((x) => setImpure(name, validatorsObject, x));
			errors_store.update((x) => setImpure(name, errorsObject, x));
			deps_store.update((x) => setImpure(name, depsObject, x));
			return;
		}
		if (!resetFieldOptions?.keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions?.keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions?.keepPristine) pristine_store.update((x) => setImpure(name, true, x));
		if (!resetFieldOptions?.keepValue) values_store.update((x) => setImpure(name, value, x));
		if (!resetFieldOptions?.keepValidator)
			validators_store.update((x) => setImpure(name, getInternal(name, defaultValidators), x));
		if (!resetFieldOptions?.keepError) errors_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions?.keepDeps) deps_store.update((x) => setImpure(name, getInternal(name, defaultDeps), x));
		//TODO: If the reset field is the only touched, dirty, pristine, or error field then reset the form state accordingly. Might be a heavy operation if the form has many nested fields due to deep value searching. Consider tracking fields by name with a derived store
	};

	const useFieldArray: UseFieldArrayFn<T> = (name) => {
		if (!Array.isArray(getInternal(name, get(values_store))))
			throw Error('Can not call useFieldArray on a field that is not an Array');
		return {
			remove: (index) => {
				const path = `${name}.${index}`;
				removePropertyImpure(path, defaultValues);
				removePropertyImpure(path, defaultValidators);
				removePropertyImpure(path, defaultDeps);
				touched_store.update((x) => removePropertyImpure(path, x));
				dirty_store.update((x) => removePropertyImpure(path, x));
				pristine_store.update((x) => removePropertyImpure(path, x));
				values_store.update((x) => removePropertyImpure(path, x));
				validators_store.update((x) => removePropertyImpure(path, x));
				errors_store.update((x) => removePropertyImpure(path, x));
			},
			append: (
				val,
				{ deps = [], validate = false, validator } = {
					deps: [],
					validate: false,
					validator: undefined,
				},
			) => {
				appendImpure(name, val, defaultValues);
				appendImpure(name, validator, defaultValidators);
				appendImpure(name, clone(deps), defaultDeps);
				touched_store.update((x) => appendImpure(name, false, x));
				dirty_store.update((x) => appendImpure(name, true, x));
				pristine_store.update((x) => appendImpure(name, false, x));
				values_store.update((x) => appendImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator) validators_store.update((x) => setImpure(`${name}.${array.length - 1}`, validator, x));
				deps_store.update((x) => appendImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`, get(internal_state_store));
			},
			prepend: (
				val,
				{ deps = [], validate = false, validator } = {
					deps: [],
					validate: false,
					validator: undefined,
				},
			) => {
				prependImpure(name, val, defaultValues);
				prependImpure(name, validator, defaultValidators);
				prependImpure(name, clone(deps), defaultDeps);
				touched_store.update((x) => prependImpure(name, false, x));
				dirty_store.update((x) => prependImpure(name, true, x));
				pristine_store.update((x) => prependImpure(name, false, x));
				values_store.update((x) => prependImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator) validators_store.update((x) => prependImpure(name, validator, x));
				deps_store.update((x) => prependImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`, get(internal_state_store));
			},
			swap: (from, to) => {
				const index1Path = `${name}.${from}`;
				const formState = get(internal_state_store);
				const fromItems = {
					touched: getInternal(index1Path, formState.touched),
					dirty: getInternal(index1Path, formState.dirty),
					pristine: getInternal(index1Path, formState.pristine),
					value: getInternal(index1Path, formState.values),
					validators: getInternal(index1Path, formState.validators),
					error: getInternal(index1Path, formState.errors),
					deps: getInternal(index1Path, formState.deps),
				};

				const index2Path = `${name}.${to}`;
				const toItems = {
					touched: getInternal(index2Path, formState.touched),
					dirty: getInternal(index2Path, formState.dirty),
					pristine: getInternal(index2Path, formState.pristine),
					value: getInternal(index2Path, formState.values),
					validators: getInternal(index2Path, formState.validators),
					error: getInternal(index2Path, formState.errors),
					deps: getInternal(index2Path, formState.deps),
				};

				if (fromItems.touched === undefined || toItems.touched === undefined) return;

				setImpure(index1Path, toItems.value, defaultValues);
				setImpure(index2Path, fromItems.value, defaultValues);

				setImpure(index1Path, toItems.validators, defaultValidators);
				setImpure(index2Path, fromItems.validators, defaultValidators);

				setImpure(index1Path, toItems.deps, defaultDeps);
				setImpure(index2Path, fromItems.deps, defaultDeps);

				touched_store.update((x) => {
					setImpure(index1Path, toItems.touched, x);
					return setImpure(index2Path, fromItems.touched, x);
				});
				errors_store.update((x) => {
					setImpure(index1Path, toItems.error, x);
					return setImpure(index2Path, fromItems.error, x);
				});
				dirty_store.update((x) => {
					setImpure(index1Path, toItems.dirty, x);
					return setImpure(index2Path, fromItems.dirty, x);
				});
				pristine_store.update((x) => {
					setImpure(index1Path, toItems.pristine, x);
					return setImpure(index2Path, fromItems.pristine, x);
				});
				deps_store.update((x) => {
					setImpure(index1Path, toItems.deps, x);
					return setImpure(index2Path, fromItems.deps, x);
				});
				values_store.update((x) => {
					setImpure(index1Path, toItems.value, x);
					return setImpure(index2Path, fromItems.value, x);
				});
				validators_store.update((x) => {
					setImpure(index1Path, toItems.validators, x);
					return setImpure(index2Path, fromItems.validators, x);
				});
			},
		};
	};

	const runValidation = async (name: string, formState: InternalFormState<T>) => {
		internal_counter_store.update((x) => setImpure('validations', x.validations + 1, x));
		try {
			const value = getInternal<T[keyof T]>(name, formState.values)!;
			if (isSchemaless) {
				const validator = getInternal<ValidatorFn<T> | AsyncValidatorFn<T>>(name, formState.validators);
				if (validator) {
					const validatorResult = await validator(value, formState);
					if (getInternal(name, errors_store) !== validatorResult)
						errors_store.update((x) => setImpure(name, validatorResult, x));
				}

				for (const trigger of findTriggers(name, get(deps_store))) {
					const triggerValue = getInternal(trigger, formState.values);
					const triggerValidator = getInternal<ValidatorFn<T> | AsyncValidatorFn<T>>(trigger, formState.validators);
					if (triggerValidator) {
						const triggerValidatorResult = await triggerValidator(triggerValue, formState);
						if (getInternal(trigger, errors_store) !== triggerValidatorResult)
							errors_store.update((x) => setImpure(trigger, triggerValidatorResult, x));
					}
				}
			}

			if (isSchema) {
				const errors = await validationResolver!(initialValues);
				if (isNil(errors)) return;

				errors_store.update((x) => setImpure(name, getInternal<string | false>(name, errors) ?? false, x));

				for (const trigger of findTriggers(name, get(deps_store)))
					errors_store.update((x) => setImpure(trigger, getInternal<string | false>(trigger, errors) ?? false, x));
			}
		} finally {
			internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));
		}
	};

	const updateOnChange = (name: string, value?: unknown) => {
		// Use of != will have side effects caused by svelte auto parsing the input value, if the bind:value is placed before the change handler then the value will be sent as the parsed value to the validator, if the bind:value is placed after then the value of e.target.event will be sent to the validator and the value of field will be autoparsed after the validator is run
		// Use of !== will remove any side effects caused by svelte auto parsing the input value, regardless of the order in which the bind:value is places
		// Using !== here to remove any side effects and to make the behaviour consistent, if the user wants to use the parsed value then making the user parse the value manually is the more preferred option. Open to ideas on this.
		// if (getInternal(name, get(form_state_store).values) != value)
		// 	values_store.update((x) => setImpure(name, parseFn ? parseFn(value) : value, x));
		if (value !== undefined) values_store.update((x) => setImpure(name, value, x));

		const formState = get(internal_state_store);
		if (!getInternal(name, formState.dirty)) dirty_store.update((x) => setImpure(name, true, x));
		if (getInternal(name, formState.pristine)) pristine_store.update((x) => setImpure(name, false, x));
		if (!formState.state.isDirty && formState.state.isPristine)
			state_store.update((x) => mergeRightDeepImpure(x, { isDirty: true, isPristine: false }));
		if (get(validate_mode_store) === 'onChange' || get(validate_mode_store) === 'all') runValidation(name, formState);
	};

	const updateOnBlur = (name: string) => {
		const formState = get(internal_state_store);
		if (!getInternal(name, formState.touched)) touched_store.update((x) => setImpure(name, true, x));
		if (!formState.state.isTouched) state_store.update((x) => setImpure('isTouched', true, x));
		if (formState.validateMode === 'onBlur' || formState.validateMode === 'all') runValidation(name, formState);
	};

	const updateOnFocus = (name: string) => {
		const formState = get(internal_state_store);
		if (formState.validateMode === 'onFocus' || formState.validateMode === 'all') runValidation(name, formState);
	};

	const register: RegisterFn = (node, { name, changeEvent }) => {
		const handleChange = () => field.handleChange(name);
		const handleBlur = () => field.handleBlur(name);
		const handleFocus = () => field.handleFocus(name);

		if (typeof changeEvent === 'string') node.addEventListener(changeEvent, handleChange);
		else if (Array.isArray(changeEvent)) changeEvent.forEach((event) => node.addEventListener(event, handleChange));
		else node.addEventListener('input', handleChange);

		node.addEventListener('blur', handleBlur);
		node.addEventListener('focus', handleFocus);

		return {
			destroy() {
				if (typeof changeEvent === 'string') node.removeEventListener(changeEvent, handleChange);
				else if (Array.isArray(changeEvent))
					changeEvent.forEach((event) => node.removeEventListener(event, handleChange));
				else node.removeEventListener('input', handleChange);

				node.removeEventListener('blur', handleBlur);
				node.removeEventListener('focus', handleFocus);
			},
		};
	};

	const field: Field = {
		handleChange: (name, val) => updateOnChange(name, val),
		handleBlur: (name) => updateOnBlur(name),
		handleFocus: (name) => updateOnFocus(name),
	};

	const form: FormControl<T> = {
		touched: {
			subscribe: touched_store.subscribe,
		},
		values: values_store,
		dirty: {
			subscribe: dirty_store.subscribe,
		},
		pristine: {
			subscribe: pristine_store.subscribe,
		},
		validators: validators_store,
		errors: {
			subscribe: errors_store.subscribe,
		},
		deps: deps_store,
		state: {
			subscribe: state_store.subscribe,
		},
		validateMode: validate_mode_store,
		field,
		useFieldArray,
		submitForm,
		resetForm,
		resetField,
		register,
	};
	const control = form;
	return {
		control,
		...form,
	};
};
