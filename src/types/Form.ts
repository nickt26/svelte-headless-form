import { Readable, Writable } from 'svelte/store';

export type FormState = {
	isSubmitting: boolean;
	isValidating: boolean;
	isTouched: boolean;
	isPristine: boolean;
	isDirty: boolean;
};

export type ValidateMode = 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus' | 'all';

export type FormObject<T extends object, S = null> = {
	[key in keyof T]: T[key] extends object
		? FormObject<T[key], S extends null ? T[key] : S>
		: S extends null
		? T[key]
		: S;
};

export type ErrorFormObject<T extends object> = {
	[key in keyof T]: T[key] extends any[]
		? string | false | ErrorFormObject<T[key]>
		: T[key] extends object
		? ErrorFormObject<T[key]>
		: string | false;
};

export type PartialFormObject<T extends object, S = null> = {
	[key in keyof T]?: T[key] extends object
		? PartialFormObject<T[key], S extends null ? T[key] : S>
		: S extends null
		? T[key]
		: S;
};

export type ArrayValidation<O extends object, T extends object> = {
	arrayValidator?: ValidatorFn<O, T>;
	fieldValidators?: Validation<O, T>;
};

export type Validation<O extends object, T extends object> = {
	[key in keyof T]?: T[key] extends any[]
		? ArrayValidation<O, T[key]> | Validation<O, T[key]>
		: T[key] extends object
		? Validation<O, T[key]>
		: ValidatorFn<O, T[key]>;
};

export type Validators<O extends object, T extends object> = {
	[key in keyof T]?: T[key] extends object ? Validators<O, T[key]> : ValidatorFn<O, T[key]>;
};

export type DependencyFields<T extends object> = FormObject<T, string[]>;
export type BooleanFields<T extends object> = FormObject<T, boolean>;
export type ErrorFields<T extends object> = ErrorFormObject<T>;
export type ValidatorFields<T extends object> = Validators<T, T>;
export type ValidatorFn<T extends object, V = any, R = null> = (
	val: V,
	formState: T
) => R extends null ? string | false : R;
export type TopLevelValidatorFn<T extends object> = (values: T) => PartialFormObject<T, string | false>;

export type FormOptions<T extends object> = {
	initialValues: T;
	validateMode?: ValidateMode;
	initialDeps?: PartialFormObject<T, string[]>;
	// revalidateMode: ValidateMode;
	// resetOptions: {
	// 	keepDirtyValues: boolean;
	// 	keepErrors: boolean;
	// };
};

export type FormOptionsSchemaless<T extends object, V extends object> = FormOptions<T> & {
	initialValidators: V;
};
export type ValidationResolver<T extends object> = (values: T) => PartialFormObject<T, string | false>;
export type FormOptionsSchema<T extends object> = FormOptions<T> & {
	validationResolver: ValidationResolver<T>;
};

export type ArrayFieldAddOptions<T extends object> = {
	deps?: string[];
	validate?: boolean;
	validator?: ValidatorFn<T>;
};

export type ResetFieldOptions = {
	keepTouched: boolean;
	keepValidator: boolean;
	keepValue: boolean;
	keepDeps: boolean;
	keepError: boolean;
	keepDirty: boolean;
	keepPristine: boolean;
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

export type SubmitFormFn<T extends object> = (
	submitFn: (values: T) => void,
	errorFn: (errors: ErrorFields<T>) => void
) => void;

export type ResetFieldFn = (name: string, options?: ResetFieldOptions) => void;

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
	resetForm: () => void;
	resetField: ResetFieldFn;
	useArrayField: UseArrayFieldFn<T>;
	validateMode: Writable<ValidateMode>;
	field: Field;
	input: Input;
};
