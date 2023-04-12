import { Writable, derived, get, writable } from 'svelte/store';
import { getInternal } from '../internal/util/get';
import { setImpure } from '../internal/util/set';
import { FormControl } from '../types/Form';

type UseFieldOptions<T extends object> = {
	name: string;
	control: FormControl<T>;
};

type UseField<S, T extends object> = {
	field: {
		value: Writable<S>;
		handleChange: (value: S) => void;
		handleBlur: () => void;
		handleFocus: () => void;
	};
	form: FormControl<T>;
};

export const useField = <S = unknown, T extends object = object>({
	name,
	control
}: UseFieldOptions<T>): UseField<S, T> => {
	//TODO: Revisit this logic to see if readonly value_store is needed
	// const value = getInternal<S, T>(name, get(control.values));
	// const value_store = derived(control.values, ($values) => getInternal<S>(name, $values)!);
	const value_store = writable(getInternal<S>(name, get(control.values)))!;
	const _ = derived(value_store, ($value) => control.values.update((x) => setImpure(name, $value, x)));
	const handleChange = (value: S) => control.field.handleChange(name, value);
	const handleBlur = () => control.field.handleBlur(name);
	const handleFocus = () => control.field.handleFocus(name);

	return {
		field: {
			value: value_store,
			handleChange,
			handleBlur,
			handleFocus
		},
		form: control
	};
};
