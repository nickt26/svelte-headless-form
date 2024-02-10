import { onDestroy } from 'svelte';
import { derived, get } from 'svelte/store';
import { UseField, UseFieldOptions } from '../internal/types/UseField';
import { getInternal } from '../internal/util/get';
import { isObject } from '../internal/util/isObject';

export const useField = <S = unknown, T extends object = object>({
	name,
	control,
}: UseFieldOptions<T>): UseField<S, T> => {
	const value_store = derived(control.values, ($values) => getInternal<S>(name as string, $values) as S);

	const valueUnsubscribe = value_store.subscribe((value) => {
		if (isObject(value) || Array.isArray(value)) throw new Error(`useField: ${name} can not be an object or array`);
	});
	onDestroy(() => valueUnsubscribe());

	const touched_store = derived(
		control.touched,
		($touched) => getInternal<boolean>(name as string, $touched) as boolean,
	);
	const dirty_store = derived(control.dirty, ($dirty) => getInternal<boolean>(name as string, $dirty) as boolean);
	const error_store = derived(
		control.errors,
		($errors) => getInternal<string | false>(name as string, $errors) as string | false,
	);

	const handleBlur = () => control.handleBlur(name);
	const handleFocus = () => control.handleFocus(name);

	return {
		field: {
			value: {
				subscribe: value_store.subscribe,
				set: (value: S) => control.updateValue(name, value as any),
				update: (fn: (value: S) => S) => control.updateValue(name, fn(get(value_store)) as any),
			},
			handleBlur,
			handleFocus,
		},
		fieldState: {
			isTouched: touched_store,
			isDirty: dirty_store,
			error: error_store,
		},
		form: control,
	};
};
