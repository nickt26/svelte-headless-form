import { assign, assignUsing } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import {
	All,
	This,
	Values,
	type BooleanFields,
	type ErrorFields,
	type FormState,
	type ValidationResolver,
	type ValidatorFields,
} from '../../types/Form';

type InitialFormValues<T extends Record<PropertyKey, unknown>> = {
	initialTouched: BooleanFields<T>;
	initialDirty: BooleanFields<T>;
	initialErrors: ErrorFields<T>;
	initialValues: T;
	initialValidators: ValidatorFields<T>;
	initialState: FormState;
	validationResolver?: ValidationResolver<T>;
};

export function createInitialValues<T extends Record<PropertyKey, unknown>>(
	formInitialValues: T,
	isSchemaless: boolean,
	isSchema: boolean,
	formInitialValidators?: ValidatorFields<T> | ((values: T) => ValidatorFields<T>),
	formValidationResolver?: ValidationResolver<T>,
): InitialFormValues<T> {
	const initialTouched = assign(false, formInitialValues);
	const initialDirty = assign(false, formInitialValues);
	const initialValues = clone(formInitialValues);
	const initialValidators = isSchemaless
		? assignUsing(
				formInitialValues,
				typeof formInitialValidators === 'function'
					? formInitialValidators(formInitialValues)
					: formInitialValidators!,
				{
					use: [This, All],
					compare: [Values],
				},
			)
		: ({} as ValidatorFields<T>);
	const validationResolver = isSchema ? formValidationResolver : undefined;
	const initialErrors = {};
	const initialState: FormState = {
		isSubmitting: false,
		isDirty: false,
		isTouched: false,
		isValidating: false,
		hasErrors: false,
		submitCount: 0,
		resetCount: 0,
	};

	return {
		initialValues,
		initialValidators,
		initialTouched,
		initialDirty,
		initialErrors,
		initialState,
		validationResolver,
	};
}
