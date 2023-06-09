import { Writable } from 'svelte/store';
import { FormControl, FormUseFieldArray } from '../../types/Form';

export type UseFieldArrayOptions<T extends object> = {
	name: string;
	control: FormControl<T>;
};

export type UseFieldArray<S, T extends object> = FormUseFieldArray<T, S> & {
	fields: Writable<S[]>;
	form: FormControl<T>;
};
