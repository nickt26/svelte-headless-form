import { Writable } from 'svelte/store';
import type { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { assignImpure } from '../../internal/util/assign';
import { isFormValidSchema, isFormValidSchemaless } from '../../internal/util/isFormValid';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import { setImpure } from '../../internal/util/set';
import type {
	BooleanFields,
	FormState,
	PartialErrorFields,
	SubmitFormFn,
	ValidationResolver,
} from '../../types/Form';

const isFormValid = async <T extends object>(
	formState: InternalFormState<T>,
	isSchemaless: boolean,
	isSchema: boolean,
	validationResolver: ValidationResolver<T> | undefined,
): Promise<[boolean, PartialErrorFields<T>]> => {
	try {
		if (isSchemaless)
			return (await isFormValidSchemaless(
				formState.values,
				formState.validators,
				formState.deps,
				formState.triggers,
				formState.touched,
				formState.dirty,
				formState.values,
				formState.validators,
				formState.deps,
			)) as [boolean, PartialErrorFields<T>];
		if (isSchema) return await isFormValidSchema(formState.values, validationResolver!);
		return [true, {}];
	} catch (_) {
		return [false, {}];
	}
};

export const createSubmitForm = <T extends object>(
	internalState: [InternalFormState<T>],
	state_store: Writable<FormState>,
	internal_counter_store: Writable<InternalFormStateCounter>,
	isSchemaless: boolean,
	isSchema: boolean,
	validationResolver: ValidationResolver<T> | undefined,
	touched_store: Writable<BooleanFields<T>>,
	errors_store: Writable<PartialErrorFields<T>>,
): SubmitFormFn<T> => {
	return (submitFn, errorFn) => {
		return (e: Event) => {
			e.preventDefault();
			return (async () => {
				const internalFormState = internalState[0];
				state_store.update((x) => setImpure('submitCount', x.submitCount + 1, x));
				internal_counter_store.update((x) =>
					mergeRightDeepImpure(x, { validations: x.validations + 1, submits: x.submits + 1 }),
				);
				const [isValid, errors] = await isFormValid(
					internalFormState,
					isSchemaless,
					isSchema,
					validationResolver,
				);
				internal_counter_store.update((x) => setImpure('validations', x.validations - 1, x));

				if (isValid) {
					try {
						await submitFn(internalFormState.values);
					} finally {
						internal_counter_store.update((x) => setImpure('submits', x.submits - 1, x));
					}
				} else {
					touched_store.update((x) => assignImpure(true, x, x));
					errors_store.update((x) => mergeRightDeepImpure(x, errors));
					try {
						if (errorFn) await errorFn(internalFormState.errors);
					} finally {
						internal_counter_store.update((x) => setImpure('submits', x.submits - 1, x));
					}
				}
			})();
		};
	};
};
