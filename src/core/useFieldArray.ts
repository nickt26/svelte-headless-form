import { derived } from 'svelte/store';
import { UseFieldArray, UseFieldArrayOptions } from '../internal/types/UseFieldArray';
import { getInternal } from '../internal/util/get';
import { setImpure } from '../internal/util/set';

export const useFieldArray = <S, T extends object = object>({
	name,
	control,
}: UseFieldArrayOptions<T>): UseFieldArray<S, T> => {
	const fields_store = derived(control.values, ($values) => getInternal<S[]>(name, $values) as S[]);

	const functions = control.useFieldArray(name);

	return {
		fields: {
			subscribe: fields_store.subscribe,
			set: (value: S[]) => control.values.update((x) => setImpure(name, value, x)),
			update: (fn: (value: S[]) => S[]) =>
				control.values.update((x) => setImpure(name, fn(getInternal<S[]>(name, x)!), x)),
		},
		...functions,
		form: control,
	};
};
