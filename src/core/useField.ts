import { onDestroy } from 'svelte';
import { derived, get } from 'svelte/store';
import { UseField, UseFieldOptions } from '../internal/types/UseField';
import { getInternal } from '../internal/util/get';
import { isObject } from '../internal/util/isObject';
import { setImpure } from '../internal/util/set';
import { DotPaths, ValueOf } from '../types/Form';

export const useField = <T extends object, TPath extends DotPaths<T>>({
	name,
	control,
}: UseFieldOptions<T, TPath>): UseField<T, TPath> => {
	const value_store = derived(control.values, ($values) =>
		getInternal<ValueOf<T, TPath>>(name, $values),
	)!;

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

	const handleBlur = () => control.handleBlur(name);
	const handleFocus = () => control.handleFocus(name);

	return {
		field: {
			value: {
				subscribe: value_store.subscribe,
				set: (value) => control.values.update((x) => setImpure(name, value, x)),
				update: (fn) => control.values.update((x) => setImpure(name, fn(get(value_store)), x)),
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
