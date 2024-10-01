import { Readable, Writable } from 'svelte/store';
import { DotPaths, FormControl, ValueOf } from '../../types/Form';

export type UseFieldOptions<T extends object, TPath extends DotPaths<T>> = {
	name: TPath;
	control: FormControl<T>;
};

export type UseField<T extends object, TPath extends DotPaths<T>> = {
	field: {
		value: Writable<ValueOf<T, TPath>>;
		onBlur: () => void;
		onFocus: () => void;
	};
	fieldState: {
		isTouched: Readable<boolean>;
		isDirty: Readable<boolean>;
		error: Readable<string | false>;
	};
	form: FormControl<T>;
};
