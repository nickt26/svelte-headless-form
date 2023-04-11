import { Readable, Writable } from 'svelte/store';

export type FormState = {
	isSubmitting: boolean;
	isValidating: boolean;
	isTouched: boolean;
	isPristine: boolean;
	isDirty: boolean;
};

export type ValidateMode = 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus' | 'none' | 'all';

export type FormObject<T extends object, S = null> = {
	[key in keyof T]: T[key] extends object
		? FormObject<T[key], S extends null ? T[key] : S>
		: S extends null
		? T[key]
		: S;
};

export type PartialFormObject<T extends object, S = null> = {
	[key in keyof T]?: T[key] extends object
		? PartialFormObject<T[key], S extends null ? T[key] : S>
		: S extends null
		? T[key]
		: S;
};

export type Validators<O extends object, T extends object> = {
	[key in keyof T]?: T[key] extends object
		? Validators<O, T[key]>
		: ValidatorFn<O, T[key]> | AsyncValidatorFn<O, T[key]>;
};

export type DependencyFields<T extends object> = FormObject<T, string[]>;
export type BooleanFields<T extends object> = FormObject<T, boolean>;
export type ErrorFields<T extends object> = FormObject<T, string | false>;
export type PartialErrorFields<T extends object> = PartialFormObject<T, string | false>;
export type ValidatorFields<T extends object> = Validators<T, T>;

export type ValidatorFn<T extends object, V = any> = (val: V, formState: T) => string | false;
export type AsyncValidatorFn<T extends object, V = any> = (val: V, formState: T) => Promise<string | false>;

export type GlobalFormOptions<T extends object> = {
	initialValues: T;
	validateMode?: ValidateMode;
	initialDeps?: PartialFormObject<T, string[]>;
	// revalidateMode: ValidateMode;
	// resetOptions: {
	// 	keepDirtyValues: boolean;
	// 	keepErrors: boolean;
	// };
};
export type FormOptionsSchemaless<V extends object> = {
	initialValidators?: V;
};
export type FormOptionsSchema<T extends object> = {
	validationResolver?: ValidationResolver<T>;
};
export type FormOptions<T extends object, V extends object> = GlobalFormOptions<T> &
	(FormOptionsSchemaless<V> | FormOptionsSchema<T>);
export type SyncValidationResolver<T extends object> = (values: T) => PartialFormObject<T, string | false>;
export type AsyncValidationResolver<T extends object> = (values: T) => Promise<PartialFormObject<T, string | false>>;
export type ValidationResolver<T extends object> = SyncValidationResolver<T> | AsyncValidationResolver<T>;

export type ArrayFieldAddOptions<T extends object> = {
	deps?: string[];
	validate?: boolean;
	validator?: ValidatorFn<T>;
};

export type ResetFieldOptions = {
	keepTouched?: boolean;
	keepValidator?: boolean;
	keepValue?: boolean;
	keepDeps?: boolean;
	keepError?: boolean;
	keepDirty?: boolean;
	keepPristine?: boolean;
};

export type UseArrayField<T extends object> = {
	remove: (index: number) => void;
	append: (value: unknown, options?: ArrayFieldAddOptions<T>) => void;
	prepend: (value: unknown, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
};

export type Field = {
	handleChange: (name: string, val: unknown) => void;
	handleBlur: (name: string) => void;
	handleFocus: (name: string) => void;
};
export type Input = {
	handleChange: (e: Event, parseFn?: <T>(val: unknown) => T) => void;
	handleBlur: (e: Event) => void;
	handleFocus: (e: Event) => void;
};

export type SubmitFn<T extends object> = ((values: T) => void) | ((values: T) => Promise<void>);
export type ErrorFn<T extends object> =
	| ((errors: ErrorFields<T>) => void)
	| ((errors: ErrorFields<T>) => Promise<void>);
export type SubmitFormFn<T extends object> = (submitFn: SubmitFn<T>, errorFn?: ErrorFn<T>) => () => void;

export type ResetFieldFn = (name: string, options?: ResetFieldOptions) => void;
export type ResetFormFn<T extends object> = (resetValues?: PartialFormObject<T>) => void;

export type UseArrayFieldFn<T extends object> = (name: string) => UseArrayField<T>;

export type Form<T extends object, V extends ValidatorFields<T>> = {
	touched: Readable<BooleanFields<T>>;
	values: Writable<T>;
	dirty: Readable<BooleanFields<T>>;
	pristine: Readable<BooleanFields<T>>;
	validators: Writable<V>;
	errors: Readable<ErrorFields<T>>;
	deps: Writable<DependencyFields<T>>;
	state: Readable<FormState>;
	submitForm: SubmitFormFn<T>;
	resetForm: ResetFormFn<T>;
	resetField: ResetFieldFn;
	useArrayField: UseArrayFieldFn<T>;
	validateMode: Writable<ValidateMode>;
	field: Field;
	input: Input;
	control: FormControl<T, V>;
};

export type FormControl<T extends object, V extends ValidatorFields<T>> = Omit<Form<T, V>, 'control'>;
