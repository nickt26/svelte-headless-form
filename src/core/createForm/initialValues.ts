import { assign } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import { mergeRightDeepImpure } from '../../internal/util/mergeRightDeep';
import type {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	FormState,
	ValidationResolver,
	ValidatorFields,
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
		? mergeRightDeepImpure(
				assign(undefined, formInitialValues),
				typeof formInitialValidators === 'function'
					? formInitialValidators(formInitialValues)
					: formInitialValidators!,
		  )
		: ({} as ValidatorFields<T>);
	const validationResolver = isSchema ? formValidationResolver : undefined;
	const initialErrors = assign(false as string | false, formInitialValues);
	const initialDeps = mergeRightDeepImpure(
		assign([] as string[], formInitialValues),
		formInitialDeps ?? {},
	);
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
