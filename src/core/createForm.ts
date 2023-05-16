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
import { someDeep } from '../internal/util/someDeep';
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
		hasErrors: false,
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
			if (isSchemaless) return await isFormValidSchemaless(formState.values, formState.validators, formState);
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

	const resetForm: ResetFormFn<T> = (values = {}, options) => {
		defaultValues = mergeRightDeepImpure(clone(initialValues), values, options);
		defaultValidators = mergeRightDeepImpure(
			clone(initialValidators),
			mergeRightDeepImpure(
				assign(undefined, values),
				mergeRightDeepImpure(defaultValidators, options?.validators ? options.validators(defaultValues) : {}),
				{
					replaceArrays: options?.replaceArrays,
					onlySameKeys: true,
				},
			),
			options,
		);
		defaultDeps = mergeRightDeepImpure(
			clone(initialDeps),
			mergeRightDeepImpure(
				assign([] as string[], values),
				mergeRightDeepImpure(defaultDeps, options?.deps ? options.deps(defaultValues) : {}),
				{
					replaceArrays: options?.replaceArrays,
					onlySameKeys: true,
				},
			),
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
				hasErrors: false,
				submitCount: 0,
				resetCount: x.resetCount + 1,
			} satisfies Partial<FormState>),
		);
	};

	const checkFormForStateReset = () => {
		const internal_state = get(internal_state_store);
		const isDirty = someDeep((x) => x === true, internal_state.dirty);
		const hasErrors = someDeep((x) => typeof x === 'string', internal_state.errors);
		const isTouched = someDeep((x) => x === true, internal_state.touched);
		if (isDirty !== internal_state.state.isDirty) state_store.update((x) => setImpure('isDirty', isDirty, x));
		if (!isDirty !== internal_state.state.isPristine) state_store.update((x) => setImpure('isPristine', !isDirty, x));
		if (hasErrors !== internal_state.state.hasErrors) state_store.update((x) => setImpure('hasErrors', hasErrors, x));
		if (isTouched !== internal_state.state.isTouched) state_store.update((x) => setImpure('isTouched', isTouched, x));
	};

	const resetField: ResetFieldFn = (name, options) => {
		const defaultValue = getInternal(name, defaultValues);
		if (isObject(defaultValue) || Array.isArray(defaultValue)) {
			const initialValue = getInternal<object>(name, initialValues);
			const existsInInitial = initialValue !== undefined;
			const valuesObject = existsInInitial ? clone(initialValue) : clone(defaultValue);
			if (!options?.keepValue) {
				values_store.update((x) => setImpure(name, valuesObject, x));
			}
			if (!options?.keepTouched) {
				const touchedObject = existsInInitial
					? clone(getInternal<object>(name, initialTouched)!)
					: assign(false, valuesObject);
				touched_store.update((x) => setImpure(name, touchedObject, x));
			}
			if (!options?.keepDirty) {
				const dirtyObject = existsInInitial
					? clone(getInternal<object>(name, initialDirty)!)
					: assign(false, valuesObject);
				dirty_store.update((x) => setImpure(name, dirtyObject, x));
			}
			if (!options?.keepPristine) {
				const pristineObject = existsInInitial
					? clone(getInternal<object>(name, initialPristine)!)
					: assign(true, valuesObject);
				pristine_store.update((x) => setImpure(name, pristineObject, x));
			}
			if (!options?.keepError) {
				const errorsObject = existsInInitial
					? clone(getInternal<object>(name, initialErrors)!)
					: assign(false as string | false, defaultValue);
				errors_store.update((x) => setImpure(name, errorsObject, x));
			}
			if (!options?.keepValidator) {
				const validatorsObject = existsInInitial
					? clone(getInternal<object>(name, initialValidators)!)
					: clone(getInternal<object>(name, defaultValidators)!);
				validators_store.update((x) => setImpure(name, validatorsObject, x));
			}
			if (!options?.keepDeps) {
				const depsObject = existsInInitial
					? clone(getInternal<object>(name, initialDeps)!)
					: clone(getInternal<object>(name, defaultDeps)!);
				deps_store.update((x) => setImpure(name, depsObject, x));
			}
			if (!options?.keepDependentErrors) {
				const triggers = findTriggers(name, get(deps_store));
				const errors = {} as PartialFormObject<T, string | false>;

				for (const trigger of triggers) setImpure(trigger, false, errors);
				errors_store.update((x) => mergeRightDeepImpure(x, errors));
			}
			checkFormForStateReset();
			return;
		}
		if (!options?.keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!options?.keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!options?.keepPristine) pristine_store.update((x) => setImpure(name, true, x));
		if (!options?.keepValue) values_store.update((x) => setImpure(name, defaultValue, x));
		if (!options?.keepValidator)
			validators_store.update((x) => setImpure(name, getInternal(name, defaultValidators), x));
		if (!options?.keepError) errors_store.update((x) => setImpure(name, false, x));
		if (!options?.keepDeps) deps_store.update((x) => setImpure(name, getInternal(name, defaultDeps), x));
		if (!options?.keepDependentErrors) {
			const triggers = findTriggers(name, get(deps_store));
			const errors = {} as PartialFormObject<T, string | false>;

			for (const trigger of triggers) setImpure(trigger, false, errors);
			errors_store.update((x) => mergeRightDeepImpure(x, errors));
		}
		checkFormForStateReset();
	};

	const useFieldArray: UseFieldArrayFn<T> = (name) => {
		if (!Array.isArray(getInternal(name, get(values_store)))) throw Error(name + ' is not an array');
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
				checkFormForStateReset();
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
					if (getInternal(name, formState.errors) !== validatorResult) {
						errors_store.update((x) => setImpure(name, validatorResult, x));
						if (!formState.state.hasErrors) state_store.update((x) => setImpure('hasErrors', true, x));
					}
				}

				for (const trigger of findTriggers(name, formState.deps)) {
					const triggerValue = getInternal(trigger, formState.values);
					const triggerValidator = getInternal<ValidatorFn<T> | AsyncValidatorFn<T>>(trigger, formState.validators);
					if (triggerValidator) {
						const triggerValidatorResult = await triggerValidator(triggerValue, formState);
						if (getInternal(trigger, formState.errors) !== triggerValidatorResult) {
							errors_store.update((x) => setImpure(trigger, triggerValidatorResult, x));
							if (!formState.state.hasErrors) state_store.update((x) => setImpure('hasErrors', true, x));
						}
					}
				}
			}

			if (isSchema) {
				const errors = await validationResolver!(formState.values);
				if (isNil(errors)) return;

				errors_store.update((x) => setImpure(name, getInternal<string | false>(name, errors) ?? false, x));

				for (const trigger of findTriggers(name, formState.deps))
					errors_store.update((x) => setImpure(trigger, getInternal<string | false>(trigger, errors) ?? false, x));
			}
		} finally {
			internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));
			if (!someDeep((x) => typeof x === 'string', formState.errors) && formState.state.hasErrors)
				state_store.update((x) => setImpure('hasErrors', false, x));
		}
	};

	const updateOnChange = (name: string, value?: unknown) => {
		if (value !== undefined) values_store.set(setImpure(name, value, get(values_store)));

		const formState = get(internal_state_store);
		if (!getInternal(name, formState.dirty)) dirty_store.update((x) => setImpure(name, true, x));
		if (getInternal(name, formState.pristine)) pristine_store.update((x) => setImpure(name, false, x));
		if (!formState.state.isDirty && formState.state.isPristine)
			state_store.update((x) => mergeRightDeepImpure(x, { isDirty: true, isPristine: false }));
		if (formState.validateMode === 'onChange' || formState.validateMode === 'all') runValidation(name, formState);
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

	const register: RegisterFn = (node, { name, changeEvent, blurEvent, focusEvent }) => {
		const handleChange = () => field.handleChange(name);
		const handleBlur = () => field.handleBlur(name);
		const handleFocus = () => field.handleFocus(name);

		if (changeEvent !== false) {
			if (typeof changeEvent === 'string') node.addEventListener(changeEvent, handleChange);
			else if (Array.isArray(changeEvent)) changeEvent.forEach((event) => node.addEventListener(event, handleChange));
			else node.addEventListener('input', handleChange);
		}

		if (blurEvent !== false) {
			if (typeof blurEvent === 'string') node.addEventListener(blurEvent, handleBlur);
			else if (Array.isArray(blurEvent)) blurEvent.forEach((event) => node.addEventListener(event, handleBlur));
			else node.addEventListener('blur', handleBlur);
		}

		if (focusEvent !== false) {
			if (typeof focusEvent === 'string') node.addEventListener(focusEvent, handleBlur);
			else if (Array.isArray(focusEvent)) focusEvent.forEach((event) => node.addEventListener(event, handleBlur));
			else node.addEventListener('focus', handleFocus);
		}

		return {
			destroy() {
				if (changeEvent !== false) {
					if (typeof changeEvent === 'string') node.removeEventListener(changeEvent, handleChange);
					else if (Array.isArray(changeEvent))
						changeEvent.forEach((event) => node.removeEventListener(event, handleChange));
					else node.removeEventListener('input', handleChange);
				}

				if (blurEvent !== false) {
					if (typeof blurEvent === 'string') node.removeEventListener(blurEvent, handleChange);
					else if (Array.isArray(blurEvent))
						blurEvent.forEach((event) => node.removeEventListener(event, handleChange));
					else node.removeEventListener('blur', handleBlur);
				}

				if (focusEvent !== false) {
					if (typeof focusEvent === 'string') node.removeEventListener(focusEvent, handleChange);
					else if (Array.isArray(focusEvent))
						focusEvent.forEach((event) => node.removeEventListener(event, handleChange));
					else node.removeEventListener('focus', handleFocus);
				}
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
