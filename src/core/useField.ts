import { Form, FormControl, ValidatorFields } from 'src/internal/types/Form';
import { getInternal } from 'src/internal/util/get';
import { setImpure } from 'src/internal/util/set';
import { Readable, derived, get, writable } from 'svelte/store';

type UseFieldOptions<T extends object, V extends ValidatorFields<T>> = {
	name: string;
	control: FormControl<T, V>;
};

type UseField<S, T extends object, V extends ValidatorFields<T>> = {
	field: {
		value: Readable<S>;
		handleChange: (value: S) => void;
		handleBlur: () => void;
		handleFocus: () => void;
	};
	form: Form<T, V>;
};

export const useField = <S = unknown, T extends object = object, V extends ValidatorFields<T> = ValidatorFields<T>>({
	name,
	control
}: UseFieldOptions<T, V>): UseField<S, T, V> => {
	//TODO: Revisit this logic to see if readonly value_store is needed
	// const value = getInternal<S, T>(name, get(control.values));
	// const value_store = derived(control.values, ($values) => getInternal<S>(name, $values)!);
	const value_store = writable(getInternal<S>(name, get(control.values)))!;
	const _ = derived(value_store, ($value) => setImpure(name, $value, get(control.values)));
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
		form: { control, ...control }
	};
};
