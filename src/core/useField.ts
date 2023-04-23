import { derived } from 'svelte/store';
import { UseField, UseFieldOptions } from '../internal/types/UseField';
import { getInternal } from '../internal/util/get';
import { setImpure } from '../internal/util/set';

export const useField = <S = unknown, T extends object = object>({
	name,
	control,
}: UseFieldOptions<T>): UseField<S, T> => {
	const value_store = derived(control.values, ($values) => getInternal<S>(name, $values) as S);

	const touched_store = derived(control.touched, ($touched) => getInternal<boolean>(name, $touched) as boolean);
	const dirty_store = derived(control.dirty, ($dirty) => getInternal<boolean>(name, $dirty) as boolean);
	const pristine_store = derived(control.pristine, ($pristine) => getInternal<boolean>(name, $pristine) as boolean);
	const error_store = derived(
		control.errors,
		($errors) => getInternal<string | false>(name, $errors) as string | false,
	);

	const handleChange = (value?: S) => control.field.handleChange(name, value);
	const handleBlur = () => control.field.handleBlur(name);
	const handleFocus = () => control.field.handleFocus(name);

	return {
		field: {
			value: {
				subscribe: value_store.subscribe,
				set: (value: S) => control.values.update((x) => setImpure(name, value, x)),
				update: (fn: (value: S) => S) => control.values.update((x) => setImpure(name, fn(getInternal<S>(name, x)!), x)),
			},
			handleChange,
			handleBlur,
			handleFocus,
		},
		fieldState: {
			isTouched: touched_store,
			isDirty: dirty_store,
			isPristine: pristine_store,
			error: error_store,
		},
		form: control,
	};
};
