import { Readable, derived } from 'svelte/store';
import { getInternal } from '../internal/util/get';
import { ArrayFieldAddOptions, FormControl } from '../types/Form';

export type UseFieldArrayOptions<T extends object> = {
	name: string;
	control: FormControl<T>;
};

export type UseFieldArray<S, T extends object> = {
	fields: Readable<S[]>;
	remove: (index: number) => void;
	append: (value: unknown, options?: ArrayFieldAddOptions<T>) => void;
	prepend: (value: unknown, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
	form: FormControl<T>;
};

export const useFieldArray = <S, T extends object = object>({
	name,
	control
}: UseFieldArrayOptions<T>): UseFieldArray<S, T> => {
	const fields_store = derived(control.values, ($values) => getInternal<S[]>(name, $values)!);

	const functions = control.useArrayField(name);

	return {
		fields: { subscribe: fields_store.subscribe },
		...functions,
		form: control
	};
};
