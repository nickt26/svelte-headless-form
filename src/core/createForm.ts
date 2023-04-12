import { get, writable } from 'svelte/store';
import { appendImpure } from '../internal/util/append';
import { assign, assignImpure } from '../internal/util/assign';
import { clone } from '../internal/util/clone';
import { findTriggers } from '../internal/util/findTriggers';
import { getInternal } from '../internal/util/get';
import { isFormValidSchema, isFormValidSchemaless } from '../internal/util/isFormValid';
import { isNil } from '../internal/util/isNil';
import { mergeRightDeepImpure } from '../internal/util/mergeRightDeep';
import { prependImpure } from '../internal/util/prepend';
import { removePropertyImpure } from '../internal/util/removeProperty';
import { setImpure } from '../internal/util/set';
import type {
	ArrayFieldAddOptions,
	AsyncValidatorFn,
	Form,
	FormOptions,
	PartialErrorFields,
	ResetFieldFn,
	ResetFormFn,
	SubmitFormFn,
	ValidatorFields,
	ValidatorFn
} from '../types/Form';

export const createForm = <T extends object>(formOptions: FormOptions<T>): Form<T> => {
	const isSchemaless = 'initialValidators' in formOptions;
	const isSchema = 'validationResolver' in formOptions;
	const validateMode = formOptions.validateMode ?? (isSchemaless ? 'onChange' : isSchema ? 'onBlur' : 'none');
	const touched = assign(false, formOptions.initialValues);
	const dirty = assign(false, formOptions.initialValues);
	const pristine = assign(true, formOptions.initialValues);
	const validators = isSchemaless
		? mergeRightDeepImpure(assign(undefined, formOptions.initialValues), formOptions.initialValidators!)
		: ({} as ValidatorFields<T>);
	const validationResolver = isSchema ? formOptions.validationResolver : undefined;
	const errors = assign(false as string | false, formOptions.initialValues);
	const deps = mergeRightDeepImpure(assign([] as string[], formOptions.initialValues), formOptions.initialDeps ?? {});
	const values = clone(formOptions.initialValues);
	const state = {
		isSubmitting: false,
		isPristine: true,
		isDirty: false,
		isTouched: false,
		isValidating: false
	};

	let defaultValues = clone(values);
	let defaultValidators = clone(validators);
	let defaultDeps = clone(deps);

	const touched_store = writable(clone(touched));
	const dirty_store = writable(clone(dirty));
	const pristine_store = writable(clone(pristine));
	const values_store = writable(clone(values));
	const validators_store = writable(clone(validators));
	const errors_store = writable(clone(errors));
	const deps_store = writable(clone(deps));
	const state_store = writable(clone(state));
	const validate_mode_store = writable(validateMode);

	const isFormValid = async (): Promise<[boolean, PartialErrorFields<T>]> => {
		try {
			console.log(get(validators_store));

			if (isSchemaless) return await isFormValidSchemaless(get(values_store), get(values_store), get(validators_store));
			if (isSchema) return await isFormValidSchema(get(values_store), validationResolver!);
			return [true, {}];
		} catch (_) {
			return [false, {}];
		}
	};

	const submitForm: SubmitFormFn<T> = (submitFn, errorFn) => {
		return () =>
			(async () => {
				state_store.update((x) => mergeRightDeepImpure(x, { isSubmitting: true, isValidating: true }));
				const [isValid, errors] = await isFormValid();
				state_store.update((x) => setImpure('isValidating', false, x));
				if (isValid) {
					try {
						await submitFn(get(values_store));
					} finally {
						state_store.update((x) => setImpure('isSubmitting', false, x));
					}
				} else {
					touched_store.update((x) => assignImpure(true, x, x));
					errors_store.update((x) => mergeRightDeepImpure(x, errors));
					try {
						if (errorFn) await errorFn(get(errors_store));
					} finally {
						state_store.update((x) => setImpure('isSubmitting', false, x));
					}
				}
			})();
	};

	const resetForm: ResetFormFn<T> = (resetValues) => {
		defaultValues = clone(values);
		defaultValidators = clone(validators);
		defaultDeps = clone(deps);
		touched_store.set(clone(touched));
		dirty_store.set(clone(dirty));
		pristine_store.set(clone(pristine));
		values_store.set(mergeRightDeepImpure(clone(values), resetValues ?? {}));
		validators_store.set(clone(validators));
		errors_store.set(clone(errors));
		deps_store.set(clone(deps));
		state_store.update((x) => mergeRightDeepImpure(x, state));
	};

	const resetField: ResetFieldFn = (
		name: string,
		resetFieldOptions = {
			keepTouched: false,
			keepDirty: false,
			keepError: false,
			keepPristine: false,
			keepDeps: false,
			keepValidator: false,
			keepValue: false
		}
	) => {
		if (!resetFieldOptions.keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions.keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions.keepPristine) pristine_store.update((x) => setImpure(name, true, x));
		if (!resetFieldOptions.keepValue) values_store.update((x) => setImpure(name, getInternal(name, defaultValues), x));
		if (!resetFieldOptions.keepValidator)
			validators_store.update((x) => setImpure(name, getInternal(name, defaultValidators), x));
		if (!resetFieldOptions.keepError) errors_store.update((x) => setImpure(name, false, x));
		if (!resetFieldOptions.keepDeps) deps_store.update((x) => setImpure(name, getInternal(name, defaultDeps), x));
		//TODO: If the reset field is the only touched, dirty, pristine, or error field then reset the form state accordingly
		//TODO: Decide if these options are still valid when resetting an array field
	};

	const useFieldArray = (name: string) => {
		if (!Array.isArray(getInternal(name, get(values_store))))
			throw Error('Attempting to use createArrayField on a field that is not an Array');
		return {
			remove: (index: number): void => {
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
				val: unknown,
				{ deps = [], validate = false, validator }: ArrayFieldAddOptions<T> = {
					deps: [],
					validate: false,
					validator: undefined
				}
			): void => {
				appendImpure(name, val, defaultValues);
				if (validator) appendImpure(name, validator, defaultValidators);
				appendImpure(name, clone(deps), defaultDeps);
				touched_store.update((x) => appendImpure(name, false, x));
				dirty_store.update((x) => appendImpure(name, true, x));
				pristine_store.update((x) => appendImpure(name, false, x));
				values_store.update((x) => appendImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator) validators_store.update((x) => setImpure(`${name}.${array.length - 1}`, validator, x));
				deps_store.update((x) => appendImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`);
			},
			prepend: (
				val: unknown,
				{ deps = [], validate = false, validator }: ArrayFieldAddOptions<T> = {
					deps: [],
					validate: false,
					validator: undefined
				}
			): void => {
				prependImpure(name, val, defaultValues);
				if (validator) prependImpure(name, validator, defaultValidators);
				prependImpure(name, clone(deps), defaultDeps);
				touched_store.update((x) => prependImpure(name, false, x));
				dirty_store.update((x) => prependImpure(name, true, x));
				pristine_store.update((x) => prependImpure(name, false, x));
				values_store.update((x) => prependImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator) validators_store.update((x) => prependImpure(name, validator, x));
				deps_store.update((x) => prependImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`);
			},
			swap: (from: number, to: number) => {
				const index1Path = `${name}.${from}`;
				const fromItems = {
					touched: getInternal(index1Path, get(touched_store)),
					dirty: getInternal(index1Path, get(dirty_store)),
					pristine: getInternal(index1Path, get(pristine_store)),
					value: getInternal(index1Path, get(values_store)),
					validators: getInternal(index1Path, get(validators_store)),
					error: getInternal(index1Path, get(errors_store)),
					deps: getInternal(index1Path, get(deps_store))
				};

				const index2Path = `${name}.${to}`;
				const toItems = {
					touched: getInternal(index2Path, get(touched_store)),
					error: getInternal(index2Path, get(errors_store)),
					dirty: getInternal(index2Path, get(dirty_store)),
					pristine: getInternal(index2Path, get(pristine_store)),
					value: getInternal(index2Path, get(values_store)),
					validators: getInternal(index2Path, get(validators_store)),
					deps: getInternal(index2Path, get(deps_store))
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
			}
		};
	};

	const runValidation = async (name: string) => {
		state_store.update((x) => setImpure('isValidating', true, x));
		try {
			const values = get(values_store);
			const value = getInternal<T[keyof T]>(name, values)!;
			if (isSchemaless) {
				const validator = getInternal<ValidatorFn<T> | AsyncValidatorFn<T>>(name, get(validators_store));
				if (validator !== undefined) {
					const validatorResult = await validator(value, values);
					errors_store.update((x) => setImpure(name, validatorResult, x));
				}

				const triggers = findTriggers(name, get(deps_store));
				for (const trigger of triggers) {
					const triggerValue = getInternal(trigger, values);
					const triggerValidator = getInternal<ValidatorFn<T> | AsyncValidatorFn<T>>(trigger, get(validators_store));
					if (triggerValidator !== undefined) {
						const triggerValidatorResult = await triggerValidator(triggerValue, values);
						errors_store.update((x) => setImpure(trigger, triggerValidatorResult, x));
					}
				}
			}

			if (isSchema) {
				const errors = await validationResolver!(values);
				if (isNil(errors)) return;

				errors_store.update((x) => setImpure(name, getInternal<string | false>(name, errors) ?? false, x));

				const triggers = findTriggers(name, get(deps_store));
				for (const trigger of triggers)
					errors_store.update((x) => setImpure(trigger, getInternal<string | false>(trigger, errors) ?? false, x));
			}
		} finally {
			state_store.update((x) => setImpure('isValidating', false, x));
		}
	};

	const updateOnChange = (name: string, value: unknown, parseFn?: <T>(val: unknown) => T) => {
		const values = get(values_store);
		const val = getInternal<number>(name, values);
		// use of != is intentional here to check here since svelte can autoParse inputs based on type and we don't want this failing on inputs with bind:value
		if (val !== undefined && val != value)
			values_store.update((x) => setImpure(name, parseFn !== undefined ? parseFn(value) : value, x));

		dirty_store.update((x) => setImpure(name, true, x));
		state_store.update((x) => setImpure('isDirty', true, x));
		pristine_store.update((x) => setImpure(name, false, x));
		state_store.update((x) => setImpure('isPristine', false, x));
		if (get(validate_mode_store) === 'onChange' || get(validate_mode_store) === 'all') runValidation(name);
	};

	const updateOnBlur = (name: string) => {
		touched_store.update((x) => setImpure(name, true, x));
		state_store.update((x) => setImpure('isTouched', true, x));
		if (get(validate_mode_store) === 'onBlur' || get(validate_mode_store) === 'all') runValidation(name);
	};

	const updateOnFocus = (name: string) => {
		if (get(validate_mode_store) === 'onFocus' || get(validate_mode_store) === 'all') runValidation(name);
	};

	const form = {
		touched: {
			subscribe: touched_store.subscribe
		},
		values: values_store,
		dirty: {
			subscribe: dirty_store.subscribe
		},
		pristine: {
			subscribe: pristine_store.subscribe
		},
		validators: validators_store,
		errors: {
			subscribe: errors_store.subscribe
		},
		deps: deps_store,
		state: {
			subscribe: state_store.subscribe
		},
		validateMode: validate_mode_store,
		field: {
			handleChange: (name: string, val: unknown) => updateOnChange(name, val),
			handleBlur: (name: string) => updateOnBlur(name),
			handleFocus: (name: string) => updateOnFocus(name)
		},
		input: {
			handleChange: (e: Event, parseFn?: <T>(val: unknown) => T) => {
				const event = e as Event & {
					target: EventTarget & HTMLInputElement;
				};
				updateOnChange(event.target.name, event.target.value, parseFn);
			},
			handleBlur: (e: Event) => {
				const event = e as Event & {
					target: EventTarget & HTMLInputElement;
				};
				updateOnBlur(event.target.name);
			},
			handleFocus: (e: Event) => {
				const event = e as Event & {
					target: EventTarget & HTMLInputElement;
				};
				updateOnFocus(event.target.name);
			}
		},
		useArrayField: useFieldArray,
		submitForm,
		resetForm,
		resetField
	};
	const control = form;
	return {
		control,
		...form
	};
};
