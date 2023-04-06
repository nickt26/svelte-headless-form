import type {
	ArrayFieldAddOptions,
	ErrorFields,
	Form,
	FormOptionsSchema,
	FormOptionsSchemaless,
	ResetFieldOptions,
	ValidatorFields,
	ValidatorFn
} from 'src/internal/types/Form';
import { appendImpure } from 'src/internal/util/append';
import { assign, assignImpure } from 'src/internal/util/assign';
import { clone } from 'src/internal/util/clone';
import { findTriggers } from 'src/internal/util/findTriggers';
import { getInternal } from 'src/internal/util/get';
import { isFormValidImpure } from 'src/internal/util/isFormValid';
import { mergeRightDeepImpure } from 'src/internal/util/mergeRightDeep';
import { prependImpure } from 'src/internal/util/prepend';
import { removePropertyImpure } from 'src/internal/util/removeProperty';
import { setImpure } from 'src/internal/util/set';
import { get, writable } from 'svelte/store';

//TODO: Add operations/branches for form with schema
export const createForm = <T extends object, V extends ValidatorFields<T> = ValidatorFields<T>>({
	initialValues,
	initialDeps = {},
	...formOptions
}: FormOptionsSchema<T> | FormOptionsSchemaless<T, V>): Form<T, V> => {
	const validateMode = formOptions.validateMode || ('initialValidators' in formOptions ? 'onChange' : 'onBlur');
	const touched = assign(false, initialValues);
	const dirty = assign(false, initialValues);
	const pristine = assign(true, initialValues);
	const validators = 'initialValidators' in formOptions ? formOptions.initialValidators : ({} as V);
	const errors = assign<string | false, T>(false, initialValues);
	const deps = mergeRightDeepImpure(assign([] as string[], initialValues), initialDeps);
	const values = initialValues;
	const state = {
		isSubmitting: false,
		isPristine: false,
		isDirty: true,
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

	const submitForm = (submitFn: (values: T) => void, errorFn?: (errors: ErrorFields<T>) => void) => {
		const [isValid, errors] = isFormValidImpure(get(values_store), get(values_store), get(validators_store));

		if (isValid) submitFn(get(values_store));
		else {
			touched_store.update((x) => assignImpure(true, x, x));
			errors_store.update((x) => mergeRightDeepImpure(x, errors));
			if (errorFn) errorFn(get(errors_store));
		}
	};

	const resetForm = () => {
		defaultValues = clone(initialValues);
		defaultValidators = clone(validators);
		defaultDeps = clone(deps);
		touched_store.set(clone(touched));
		dirty_store.set(clone(dirty));
		pristine_store.set(clone(pristine));
		values_store.set(clone(initialValues));
		validators_store.set(clone(validators));
		errors_store.set(clone(errors));
		deps_store.set(clone(deps));
	};

	const resetField = (
		name: string,
		{ keepTouched, keepDirty, keepError, keepPristine, keepDeps, keepValidator, keepValue }: ResetFieldOptions = {
			keepTouched: false,
			keepDirty: false,
			keepError: false,
			keepPristine: false,
			keepDeps: false,
			keepValidator: false,
			keepValue: false
		}
	) => {
		if (!keepTouched) touched_store.update((x) => setImpure(name, false, x));
		if (!keepDirty) dirty_store.update((x) => setImpure(name, false, x));
		if (!keepPristine) pristine_store.update((x) => setImpure(name, true, x));
		if (!keepValue) values_store.update((x) => setImpure(name, getInternal(name, defaultValues), x));
		if (!keepValidator) validators_store.update((x) => setImpure(name, getInternal(name, defaultValidators), x));
		if (!keepError) errors_store.update((x) => setImpure(name, false, x));
		if (!keepDeps) deps_store.update((x) => setImpure(name, getInternal(name, defaultDeps), x));
	};

	const useArrayField = (name: string) => {
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
				const array = getInternal<any[], T>(name, get(values_store))!;
				if (validator) validators_store.update((x) => setImpure(`${name}.${array.length - 1}`, validator, x));
				errors_store.update((x) => {
					const err = validate && validator ? validator(val, get(values_store)) : false;
					return appendImpure(name, err, x);
				});
				deps_store.update((x) => appendImpure(name, clone(deps), x));
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
				if (validator) validators_store.update((x) => prependImpure(name, validator, x));
				errors_store.update((x) => {
					const err = validate && validator ? validator(val, get(values_store)) : false;
					return prependImpure(name, err, x);
				});
				deps_store.update((x) => prependImpure(name, clone(deps), x));
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

	const updateOnChange = (name: string, value: unknown, parseFn?: <T>(val: unknown) => T) => {
		const values = get(values_store);
		const val = getInternal<number, T>(name, values);
		// use of != is intentional here to check val of input that was changed by svelte to a number automatically based on input type
		if (val !== undefined && val != value)
			values_store.update((x) => setImpure(name, parseFn !== undefined ? parseFn(value) : value, x));

		dirty_store.update((x) => setImpure(name, true, x));
		pristine_store.update((x) => setImpure(name, false, x));
		if (get(validate_mode_store) === 'onChange' || get(validate_mode_store) === 'all') {
			const values = get(values_store);
			const value = getInternal<T[keyof T], T>(name, values);
			const validator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(name, get(validators_store));
			if (validator !== undefined) errors_store.update((x) => setImpure(name, validator(value, values), x));

			const triggers = findTriggers(name, get(deps_store));
			for (const trigger of triggers) {
				const triggerValue = getInternal<T[keyof T], T>(trigger, values);
				const triggerValidator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(trigger, get(validators_store));
				if (triggerValidator !== undefined)
					errors_store.update((x) => setImpure(trigger, triggerValidator(triggerValue, values), x));
			}
		}
	};

	const updateOnBlur = (name: string) => {
		touched_store.update((x) => setImpure(name, true, x));
		if (get(validate_mode_store) === 'onBlur' || get(validate_mode_store) === 'all') {
			const values = get(values_store);
			const value = getInternal<T[keyof T], T>(name, values);
			const validator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(name, get(validators_store));
			if (validator !== undefined) errors_store.update((x) => setImpure(name, validator(value, values), x));

			const triggers = findTriggers(name, get(deps_store));
			for (const trigger of triggers) {
				const triggerValue = getInternal<T[keyof T], T>(trigger, values);
				const triggerValidator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(trigger, get(validators_store));
				if (triggerValidator !== undefined)
					errors_store.update((x) => setImpure(trigger, triggerValidator(triggerValue, values), x));
			}
		}
	};

	const updateOnFocus = (name: string) => {
		if (get(validate_mode_store) === 'onFocus' || get(validate_mode_store) === 'all') {
			const values = get(values_store);
			const value = getInternal<T[keyof T], T>(name, values);
			const validator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(name, get(validators_store));
			if (validator !== undefined) errors_store.update((x) => setImpure(name, validator(value, values), x));

			const triggers = findTriggers(name, get(deps_store));
			for (const trigger of triggers) {
				const triggerValue = getInternal<T[keyof T], T>(trigger, values);
				const triggerValidator = getInternal<ValidatorFn<T>, ValidatorFields<T>>(trigger, get(validators_store));
				if (triggerValidator !== undefined)
					errors_store.update((x) => setImpure(trigger, triggerValidator(triggerValue, values), x));
			}
		}
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
		useArrayField,
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
