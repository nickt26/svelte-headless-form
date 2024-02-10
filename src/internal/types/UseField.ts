import { Readable, Writable } from 'svelte/store';
import { DotPaths, FormControl } from '../../types/Form';

export type UseFieldOptions<T extends object> = {
	name: DotPaths<T>;
	control: FormControl<T>;
};

export type UseField<S, T extends object> = {
	field: {
		value: Writable<S>;
		// handleChange: (value: S) => void;
		handleBlur: () => void;
		handleFocus: () => void;
	};
	fieldState: {
		isTouched: Readable<boolean>;
		isDirty: Readable<boolean>;
		error: Readable<string | false>;
	};
	form: FormControl<T>;
};
