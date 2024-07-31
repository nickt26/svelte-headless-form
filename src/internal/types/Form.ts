import {
	BooleanFields,
	ErrorFields,
	FormState,
	ValidateMode,
	ValidatorFields,
} from '../../types/Form';

export type InternalFormState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
	validators: ValidatorFields<T>;
	state: FormState;
	validateMode: ValidateMode;
};

export type InternalFormStateCounter = {
	validations: number;
	submits: number;
};
