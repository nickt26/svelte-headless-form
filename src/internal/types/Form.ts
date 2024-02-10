import {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	FormState,
	TriggerFields,
	ValidateMode,
	ValidatorFields,
} from '../../types/Form';

export type InternalFormState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
	validators: ValidatorFields<T>;
	deps: DependencyFieldsInternal<T>;
	triggers: TriggerFields<T>;
	state: FormState;
	validateMode: ValidateMode;
};

export type InternalFormStateCounter = {
	validations: number;
	submits: number;
};
