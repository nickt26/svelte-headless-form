import { Writable } from 'svelte/store';
import { ArrayDotPaths, FormControl, FormUseFieldArray } from '../../types/Form';

export type UseFieldArrayOptions<T extends Record<PropertyKey, unknown>> = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	name: ArrayDotPaths<T> | ({} & string);
	control: FormControl<T>;
};

export type UseFieldArray<S, T extends Record<PropertyKey, unknown>> = FormUseFieldArray<T, S> & {
	fields: Writable<S[]>;
	form: FormControl<T>;
};
