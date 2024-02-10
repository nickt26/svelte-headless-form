import { Readable } from 'svelte/store';
import { DotPaths, FormControl, FormUseFieldArray } from '../../types/Form';

export type UseFieldArrayOptions<T extends object> = {
	name: DotPaths<T> | ({} & string);
	control: FormControl<T>;
};

export type UseFieldArray<S, T extends object> = FormUseFieldArray<T, S> & {
	fields: Readable<S[]>;
	form: FormControl<T>;
};
