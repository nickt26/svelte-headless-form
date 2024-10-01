import { onDestroy } from 'svelte';
import { Writable } from 'svelte/store';
import { InternalFormStateCounter } from '../../internal/types/Form';
import { setI } from '../../internal/util/set';
import { FormState } from '../../types/Form';

export function handleSubscriptions(
	internal_counter_store: Writable<InternalFormStateCounter>,
	state_store: Writable<FormState>,
): void {
	const counterUnsub = internal_counter_store.subscribe((x) => {
		x.validations > 0
			? state_store.update((x) => setI('isValidating', true, x))
			: state_store.update((x) => setI('isValidating', false, x));

		x.submits > 0
			? state_store.update((x) => setI('isSubmitting', true, x))
			: state_store.update((x) => setI('isSubmitting', false, x));
	});

	onDestroy(counterUnsub);
}
