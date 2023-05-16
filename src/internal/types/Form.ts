import {
	BooleanFields,
	DependencyFields,
	ErrorFields,
	FormState,
	ValidateMode,
	ValidatorFields,
} from '../../types/Form';

export type InternalFormState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	pristine: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
	validators: ValidatorFields<T>;
	deps: DependencyFields<T>;
	state: FormState;
	validateMode: ValidateMode;
};

export type InternalFormStateCounter = {
	validations: number;
	submits: number;
};
