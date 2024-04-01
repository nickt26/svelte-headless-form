import { Writable, get } from 'svelte/store';
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
	internalState: [InternalFormState<T>],
	checkFormForStateReset: () => void,
	runValidation: (name: string, internalFormState: [InternalFormState<T>]) => Promise<void>,
): UseFieldArrayFnInternal {
	return (name) => {
		const formState = internalState[0];
		if (typeof name !== 'string') throw Error('name must be a string'); // type check
		if (!Array.isArray(getInternal(name, formState.values))) throw Error(name + ' is not an array');

		return {
			remove: (index) => {
				const path = `${name}.${index}`;
				touched_store.update((x) => removePropertyImpure(path, x));
				dirty_store.update((x) => removePropertyImpure(path, x));
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
				touched_store.update((x) => appendImpure(name, false, x));
				dirty_store.update((x) => appendImpure(name, true, x));
				values_store.update((x) => appendImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator)
					validators_store.update((x) => setImpure(`${name}.${array.length - 1}`, validator, x));
				deps_store.update((x) => appendImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`, [internalState[0]]);
			},
			prepend: (
				val,
				{ deps = [], validate = false, validator } = {
					deps: [],
					validate: false,
					validator: undefined,
				},
			) => {
				touched_store.update((x) => prependImpure(name, false, x));
				dirty_store.update((x) => prependImpure(name, true, x));
				values_store.update((x) => prependImpure(name, val, x));
				const array = getInternal<any[]>(name, get(values_store))!;
				if (validator) validators_store.update((x) => prependImpure(name, validator, x));
				deps_store.update((x) => prependImpure(name, clone(deps), x));
				if (validator && validate) runValidation(`${name}.${array.length - 1}`, [internalState[0]]);
			},
			swap: (from, to) => {
				const formState = internalState[0];

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

				if (fromItems.touched === undefined || toItems.touched === undefined) return;

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
			},
		};
	};
}
