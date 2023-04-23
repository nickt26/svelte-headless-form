import { Readable, Writable } from 'svelte/store';

export type FormState = {
	isSubmitting: boolean;
	isValidating: boolean;
	isTouched: boolean;
	isPristine: boolean;
	isDirty: boolean;
	submitCount: number;
	resetCount: number;
};

export type ValidateMode = 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus' | 'none' | 'all';

export type FormObject<T extends object, S = null> = {
	[key in keyof T]: T[key] extends object ? FormObject<T[key], S> : S extends null ? T[key] : S;
};

export type PartialFormObject<T extends object, S = null> = {
	[key in keyof T]?: T[key] extends object ? PartialFormObject<T[key], S> : S extends null ? T[key] : S;
};

export type Validators<O extends object, T extends object> = {
	[key in keyof T]: T[key] extends object
		? Validators<O, T[key]>
		: ValidatorFn<O, T[key]> | AsyncValidatorFn<O, T[key]> | undefined;
};

export type PartialValidators<O extends object, T extends object> = {
	[key in keyof T]?: T[key] extends object
		? Validators<O, T[key]>
		: ValidatorFn<O, T[key]> | AsyncValidatorFn<O, T[key]>;
};

export type DependencyFields<T extends object> = FormObject<T, string[]>;
export type BooleanFields<T extends object> = FormObject<T, boolean>;
export type ErrorFields<T extends object> = FormObject<T, string | false>;
export type PartialErrorFields<T extends object> = PartialFormObject<T, string | false>;
export type ValidatorFields<T extends object> = Validators<T, T>;
export type PartialValidatorFields<T extends object> = PartialValidators<T, T>;

export type ValidatorFn<T extends object, V = any> = (val: V, formState: ValidatorFormState<T>) => string | false;
export type AsyncValidatorFn<T extends object, V = any> = (
	val: V,
	formState: ValidatorFormState<T>,
) => Promise<string | false>;

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
export type FormOptionsSchemaless<T extends object> = {
	initialValidators?: PartialValidatorFields<T>;
};
export type FormOptionsSchema<T extends object> = {
	validationResolver?: ValidationResolver<T>;
};
export type FormOptions<T extends object> = GlobalFormOptions<T> & (FormOptionsSchemaless<T> | FormOptionsSchema<T>);
export type SyncValidationResolver<T extends object> = (values: T) => PartialErrorFields<T>;
export type AsyncValidationResolver<T extends object> = (values: T) => Promise<PartialErrorFields<T>>;
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

export type FormUseFieldArray<T extends object, S = unknown> = {
	remove: (index: number) => void;
	append: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	prepend: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
};

export type Field = {
	handleChange: <T>(name: string, val?: T) => void;
	handleBlur: (name: string) => void;
	handleFocus: (name: string) => void;
};

export type SubmitFn<T extends object> = ((values: T) => void) | ((values: T) => Promise<void>);
export type ErrorFn<T extends object> =
	| ((errors: ErrorFields<T>) => void)
	| ((errors: ErrorFields<T>) => Promise<void>);
export type SubmitFormFn<T extends object> = (submitFn: SubmitFn<T>, errorFn?: ErrorFn<T>) => Noop;

export type ResetFieldFn = (name: string, options?: ResetFieldOptions) => void;
export type ResetFormFn<T extends object> = (
	resetValues?: PartialFormObject<T>,
	options?: { replaceArrays: boolean },
) => void;

export type UseFieldArrayFn<T extends object> = (name: string) => FormUseFieldArray<T>;

export type RegisterOptions = {
	name: string;
	changeEvent?: string | string[];
};

export type RegisterFn = (node: HTMLElement, options: RegisterOptions) => { destroy: Noop };

export type Form<T extends object> = {
	touched: Readable<BooleanFields<T>>;
	values: Writable<T>;
	dirty: Readable<BooleanFields<T>>;
	pristine: Readable<BooleanFields<T>>;
	validators: Writable<ValidatorFields<T>>;
	errors: Readable<ErrorFields<T>>;
	deps: Writable<DependencyFields<T>>;
	state: Readable<FormState>;
	submitForm: SubmitFormFn<T>;
	resetForm: ResetFormFn<T>;
	resetField: ResetFieldFn;
	useFieldArray: UseFieldArrayFn<T>;
	validateMode: Writable<ValidateMode>;
	field: Field;
	register: RegisterFn;
	control: FormControl<T>;
};

export type ValidatorFormState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	pristine: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
};

export type FormControl<T extends object> = Omit<Form<T>, 'control'>;

export type Noop = () => void;
