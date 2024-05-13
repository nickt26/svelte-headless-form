import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { appendImpure } from '../../internal/util/append';
import { clone } from '../../internal/util/clone';
import { getInternal } from '../../internal/util/get';
import { prependImpure } from '../../internal/util/prepend';
import { removePropertyImpure } from '../../internal/util/removeProperty';
import { setImpure } from '../../internal/util/set';
import {
	BooleanFields,
	DependencyFields,
	ErrorFields,
	UseFieldArrayFnInternal,
	ValidatorFields,
} from '../../types/Form';

export function createUseFieldArray<T extends object>(
	values_store: Writable<T>,
	touched_store: Writable<BooleanFields<T>>,
	dirty_store: Writable<BooleanFields<T>>,
	validators_store: Writable<ValidatorFields<T>>,
	errors_store: Writable<ErrorFields<T>>,
	deps_store: Writable<DependencyFields>,
	should_validate_store: Writable<boolean>,
	internalState: [InternalFormState<T>],
	checkFormForStateReset: () => void,
	runValidation: (name: string, internalFormState: [InternalFormState<T>]) => Promise<void>,
): UseFieldArrayFnInternal {
	return (name) => {
		const formState = internalState[0];
		if (typeof name !== 'string') {
			throw Error('name must be a string');
		}

		const arrValue = getInternal(name, formState.values);
		if (!Array.isArray(arrValue)) {
			throw Error(`Field (${name}) is not an array`);
		}

		return {
			remove: (index) => {
				if (index < 0 || index >= getInternal<Array<any>>(name, formState.values)!.length) {
					throw Error(`Index (${index}) is out of bounds`);
				}
				const path = `${name}.${index}`;
				touched_store.update((x) => removePropertyImpure(path, x));
				dirty_store.update((x) => removePropertyImpure(path, x));
				values_store.update((x) => removePropertyImpure(path, x));
				validators_store.update((x) => removePropertyImpure(path, x));
				errors_store.update((x) => removePropertyImpure(path, x));
				deps_store.update((x) => removePropertyImpure(path, x));
				checkFormForStateReset();
			},
			append: (val, { deps = [], validate = false, validator } = {}) => {
				should_validate_store.set(false);
				touched_store.update((x) => appendImpure(name, false, x));
				dirty_store.update((x) => appendImpure(name, false, x));
				values_store.update((x) => appendImpure(name, val, x));
				const array = getInternal<any[]>(name, formState.values)!;
				const path = `${name}.${array.length - 1}`;
				if (validator) {
					validators_store.update((x) => setImpure(path, validator, x));
				} else {
					validators_store.update((x) => setImpure(path, undefined, x));
				}
				deps_store.update((x) => appendImpure(name, clone(deps), x));
				should_validate_store.set(true);
				if (validator && validate) {
					runValidation(path, [internalState[0]]);
				} else {
					errors_store.update((x) => setImpure(path, false, x));
				}
			},
			prepend: (val, { deps = [], validate = false, validator } = {}) => {
				should_validate_store.set(false);
				touched_store.update((x) => prependImpure(name, false, x));
				dirty_store.update((x) => prependImpure(name, false, x));
				values_store.update((x) => prependImpure(name, val, x));
				if (validator) {
					validators_store.update((x) => prependImpure(name, validator, x));
				} else {
					validators_store.update((x) => prependImpure(name, undefined, x));
				}
				deps_store.update((x) => prependImpure(name, clone(deps), x));
				should_validate_store.set(true);
				if (validator && validate) {
					runValidation(`${name}.0`, internalState);
				} else {
					errors_store.update((x) => prependImpure(name, false, x));
				}
			},
			swap: (from, to) => {
				const formState = internalState[0];
				const array = getInternal<Array<any>>(name, formState.values)!;
				if (from < 0 || from >= array.length) {
					throw Error(`From index (${from}) is out of bounds`);
				}

				if (to < 0 || to >= array.length) {
					throw Error(`To index (${to}) is out of bounds`);
				}

				should_validate_store.set(false);

				const index1Path = `${name}.${from}`;
				const fromItems = {
					touched: getInternal(index1Path, formState.touched),
					dirty: getInternal(index1Path, formState.dirty),
					value: getInternal(index1Path, formState.values),
					validators: getInternal(index1Path, formState.validators),
					error: getInternal(index1Path, formState.errors),
					deps: getInternal(index1Path, formState.deps),
				};

				const index2Path = `${name}.${to}`;
				const toItems = {
					touched: getInternal(index2Path, formState.touched),
					dirty: getInternal(index2Path, formState.dirty),
					value: getInternal(index2Path, formState.values),
					validators: getInternal(index2Path, formState.validators),
					error: getInternal(index2Path, formState.errors),
					deps: getInternal(index2Path, formState.deps),
				};

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

				should_validate_store.set(true);
			},
		};
	};
}
