import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { assign } from '../../internal/util/assign';
import { getInternal } from '../../internal/util/get';
import { isObject } from '../../internal/util/isObject';
import { setImpure } from '../../internal/util/set';
import { BooleanFields, FormState, LatestFieldEvent } from '../../types/Form';

export function createHandleBlur<T extends object>(
	internalState: [InternalFormState<T>],
	latest_field_event_store: Writable<LatestFieldEvent | null>,
	touched_store: Writable<BooleanFields<T>>,
	state_store: Writable<FormState>,
	runValidation: (name: string) => Promise<void>,
): (name: string) => Promise<void> {
	return async function (name) {
		const formState = internalState[0];

		latest_field_event_store.update(() => ({ field: name, event: 'beforeBlur' }));

		const fieldTouched = getInternal(name, formState.touched);
		if (fieldTouched === undefined) return;

		const fieldValue = getInternal(name, internalState[0].values);

		if (isObject(fieldValue) || Array.isArray(fieldValue)) {
			touched_store.update((x) => setImpure(name, assign(true, fieldValue), x));
		} else if (fieldTouched === false) {
			touched_store.update((x) => setImpure(name, true, x));
		}

		if (!formState.state.isTouched) {
			state_store.update((x) => setImpure('isTouched', true, x));
		}
		if (formState.validateMode === 'onBlur' || formState.validateMode === 'all') {
			await runValidation(name, internalState);
		}
		latest_field_event_store.update(() => ({ field: name, event: 'afterBlur' }));
	};
}
