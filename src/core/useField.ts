import { onDestroy } from 'svelte';
import { derived, get, Writable } from 'svelte/store';
import { UseField, UseFieldOptions } from '../internal/types/UseField';
import { getInternal } from '../internal/util/get';
import { isObject } from '../internal/util/isObject';
import { setI } from '../internal/util/set';
import { DotPaths, ValueOf } from '../types/Form';

export const useField = <T extends object, TPath extends DotPaths<T>>({
	name,
	control,
}: UseFieldOptions<T, TPath>): UseField<T, TPath> => {
	const value_store = derived<Writable<T>, ValueOf<T, TPath>>(control.values, ($values) =>
		getInternal<ValueOf<T, TPath>>(name, $values),
	);

	const valueUnsubscribe = value_store.subscribe((value) => {
		if (isObject(value) || Array.isArray(value))
			throw new Error(`useField: ${name} can not be an object or array`);
	});
	onDestroy(() => valueUnsubscribe());

	const touched_store = derived(
		control.touched,
		($touched) => getInternal<boolean>(name as string, $touched)!,
	);
	const dirty_store = derived(
		control.dirty,
		($dirty) => getInternal<boolean>(name as string, $dirty)!,
	);
	const error_store = derived(
		control.errors,
		($errors) => getInternal<string | false>(name as string, $errors)!,
	);

	return {
		field: {
			value: {
				subscribe: value_store.subscribe,
				set: (value) => control.values.update((x) => setI(name, value, x)),
				update: (fn) => control.values.update((x) => setI(name, fn(get(value_store)), x)),
			},
			onBlur: () => control.handleBlur(name),
			onFocus: () => control.handleFocus(name),
		},
		fieldState: {
			isTouched: touched_store,
			isDirty: dirty_store,
			error: error_store,
		},
		form: control,
	};
};
