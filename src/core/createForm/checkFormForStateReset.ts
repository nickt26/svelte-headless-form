import { Readable, Writable, get } from 'svelte/store';
import { InternalFormState } from '../../internal/types/Form';
import { setImpure } from '../../internal/util/set';
import { someDeep } from '../../internal/util/someDeep';
import { FormState } from '../../types/Form';

export function createCheckFormForStateReset<T extends object>(
	internalState: [InternalFormState<T>],
	state_store: Writable<FormState>,
): () => void {
	return () => {
		const internalFormState = internalState[0];
		const isDirty = someDeep((x) => x === true, internalFormState.dirty);
		const hasErrors = someDeep((x) => typeof x === 'string', internalFormState.errors);
		const isTouched = someDeep((x) => x === true, internalFormState.touched);
		if (isDirty !== internalFormState.state.isDirty)
			state_store.update((x) => setImpure('isDirty', isDirty, x));
		if (hasErrors !== internalFormState.state.hasErrors)
			state_store.update((x) => setImpure('hasErrors', hasErrors, x));
		if (isTouched !== internalFormState.state.isTouched)
			state_store.update((x) => setImpure('isTouched', isTouched, x));
	};
}
