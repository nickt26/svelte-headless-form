import { Writable } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { getInternal } from '../../internal/util/get';
import { LatestFieldEvent } from '../../types/Form';

export function createHandleFocus<T extends object>(
	latest_field_event_store: Writable<LatestFieldEvent>,
	internalState: [InternalFormState<T>],
	runValidation: (name: string, formState: [InternalFormState<T>]) => Promise<void>,
): (name: string) => Promise<void> {
	return async (name) => {
		latest_field_event_store.set({ field: name, event: 'beforeFocus' });
		const formState = internalState[0];
		const fieldTouched = getInternal<boolean>(name, formState.touched);
		if (fieldTouched === undefined) return;
		if (formState.validateMode === 'onFocus' || formState.validateMode === 'all')
			await runValidation(name, internalState);
		latest_field_event_store.set({ field: name, event: 'afterFocus' });
	};
}
