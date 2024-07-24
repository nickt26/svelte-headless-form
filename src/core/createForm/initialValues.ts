import { assign, assignUsing } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import {
	All,
	This,
	Values,
	type BooleanFields,
	type DependencyFieldsInternal,
	type ErrorFields,
	type FormState,
	type ValidationResolver,
	type ValidatorFields,
} from '../../types/Form';

type InitialFormValues<T extends object> = {
	initialTouched: BooleanFields<T>;
	initialDirty: BooleanFields<T>;
	initialErrors: ErrorFields<T>;
	initialValues: T;
	initialValidators: ValidatorFields<T>;
	initialDeps: DependencyFieldsInternal<T>;
	initialState: FormState;
	validationResolver?: ValidationResolver<T>;
};

export function createInitialValues<T extends object>(
	formInitialValues: T,
	isSchemaless: boolean,
	isSchema: boolean,
	formInitialValidators?: ValidatorFields<T> | ((values: T) => ValidatorFields<T>),
	formValidationResolver?: ValidationResolver<T>,
	formInitialDeps?: DependencyFieldsInternal<T>,
): InitialFormValues<T> {
	const initialTouched = assign(false, formInitialValues);
	const initialDirty = assign(false, formInitialValues);
	const initialValues = clone(formInitialValues);
	const initialValidators = isSchemaless
		? // TODO: think of unique validator symbols
			assignUsing(
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
	const initialDeps = assignUsing(initialValues, formInitialDeps ?? {});
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
		initialDeps,
		initialTouched,
		initialDirty,
		initialErrors,
		initialState,
		validationResolver,
	};
}
