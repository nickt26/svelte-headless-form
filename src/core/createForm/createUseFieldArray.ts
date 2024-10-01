import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { appendI } from '../../internal/util/append';
import { noFormUpdate, noValidate } from '../../internal/util/clone';
import { getInternal } from '../../internal/util/get';
import { prependI } from '../../internal/util/prepend';
import { removePropertyI } from '../../internal/util/removeProperty';
import { setI } from '../../internal/util/set';
import {
	BooleanFields,
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
	internalState: [InternalFormState<T>],
	checkFormForStateReset: () => void,
	runValidation: (name: string) => Promise<void>,
): UseFieldArrayFnInternal {
	return (name) => {
		const formState = internalState[0];
		if (typeof name !== 'string') throw Error('name must be a string');
		const arrValue = getInternal(name, formState.values);
		if (!Array.isArray(arrValue)) throw Error(`Field (${name}) is not an array`);

		return {
			remove: (index) => {
				if (index < 0 || index >= (getInternal<Array<any>>(name, formState.values)?.length ?? 0)) {
					throw Error(`Index (${index}) is out of bounds`);
				}
				const path = `${name}.${index}`;
				touched_store.update((x) => removePropertyI(path, x));
				dirty_store.update((x) => removePropertyI(path, x));
				values_store.update((x) => removePropertyI(path, x));
				validators_store.update((x) => removePropertyI(path, x));
				errors_store.update((x) => removePropertyI(path, x));
				checkFormForStateReset();
			},
			append: (val, { validate = false, validator } = {}) => {
				touched_store.update((x) => appendI(name, false, x));
				dirty_store.update((x) => appendI(name, false, x));
				values_store.update((x) =>
					setI(
						name,
						[
							{ [noValidate]: true, [noFormUpdate]: true },
							[...getInternal<any[]>(name, formState.values)!, val],
						],
						x,
					),
				);
				const array = getInternal<any[]>(name, formState.values)!;
				const path = `${name}.${array.length - 1}`;
				validators_store.update((x) => setI(path, validator, x));
				if (validator && validate) runValidation(path);
				else if (Array.isArray(getInternal(name, internalState[0].errors)))
					errors_store.update((x) => setI(path, false, x));
			},
			prepend: (val, { validate = false, validator } = {}) => {
				touched_store.update((x) => prependI(name, false, x));
				dirty_store.update((x) => prependI(name, false, x));
				values_store.update((x) =>
					prependI(name, [{ [noValidate]: true, [noFormUpdate]: true }, val], x),
				);
				if (validator) validators_store.update((x) => prependI(name, validator, x));
				else validators_store.update((x) => prependI(name, undefined, x));
				if (validator && validate) runValidation(`${name}.0`);
				else if (Array.isArray(getInternal(name, internalState[0].errors)))
					errors_store.update((x) => prependI(name, false, x));
			},
			swap: (from, to) => {
				const formState = internalState[0];
				const array = getInternal<Array<any>>(name, formState.values)!;

				if (from < 0 || from >= array.length) throw Error(`From index (${from}) is out of bounds`);
				if (to < 0 || to >= array.length) throw Error(`To index (${to}) is out of bounds`);

				const index1Path = `${name}.${from}`;
				const fromItems = {
					touched: getInternal(index1Path, formState.touched),
					dirty: getInternal(index1Path, formState.dirty),
					value: getInternal(index1Path, formState.values),
					validators: getInternal(index1Path, formState.validators),
					error: getInternal(index1Path, formState.errors),
				};

				const index2Path = `${name}.${to}`;
				const toItems = {
					touched: getInternal(index2Path, formState.touched),
					dirty: getInternal(index2Path, formState.dirty),
					value: getInternal(index2Path, formState.values),
					validators: getInternal(index2Path, formState.validators),
					error: getInternal(index2Path, formState.errors),
				};

				touched_store.update((x) => {
					setI(index1Path, toItems.touched, x);
					return setI(index2Path, fromItems.touched, x);
				});
				errors_store.update((x) => {
					setI(index1Path, toItems.error, x);
					return setI(index2Path, fromItems.error, x);
				});
				dirty_store.update((x) => {
					setI(index1Path, toItems.dirty, x);
					return setI(index2Path, fromItems.dirty, x);
				});
				values_store.update((x) => {
					setI(index1Path, [{ [noValidate]: true, [noFormUpdate]: true }, toItems.value], x);
					return setI(
						index2Path,
						[{ [noValidate]: true, [noFormUpdate]: true }, fromItems.value],
						x,
					);
				});
				validators_store.update((x) => {
					setI(index1Path, toItems.validators, x);
					return setI(index2Path, fromItems.validators, x);
				});
			},
		};
	};
}
