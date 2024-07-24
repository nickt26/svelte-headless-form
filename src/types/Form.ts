import { Readable, Writable } from 'svelte/store';

export type FormState = {
	isSubmitting: boolean;
	isValidating: boolean;
	isTouched: boolean;
	isDirty: boolean;
	hasErrors: boolean;
	submitCount: number;
	resetCount: number;
};

export type ValidateMode = 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus' | 'none' | 'all';

export type ObjectDeep<T extends object, S = null> = {
	[key in keyof T]: Extract<T[key], object> extends never
		? S extends null
			? T[key]
			: S
		: ObjectDeep<Extract<T[key], object>, S> | Exclude<T[key], object>;
};

export type PartialDeep<T extends object | null, S = null> = {
	[key in keyof T]?: Extract<T[key], object> extends never
		? S extends null
			? T[key]
			: S
		: PartialDeep<Extract<T[key], object>, S> | Exclude<T[key], object>;
};

export type ReadonlyDeep<T extends object> = {
	readonly [key in keyof T]: Extract<T[key], object> extends never
		? T[key]
		: ReadonlyDeep<Extract<T[key], object>> | Exclude<T[key], object>;
};

export type Equals<T, U> =
	(<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? true : false;

export type ValueOf<T, Key extends string> =
	Equals<T, object> extends true
		? unknown
		: T extends object
			? Key extends `${infer Parent}.${infer Leaf}`
				? ValueOf<T[Parent & keyof T], Leaf>
				: T[Key & keyof T]
			: never;

export type ArrayValueOf<T, Key extends string> =
	Equals<T, object> extends true
		? unknown
		: T extends object
			? Key extends `${infer Parent}.${infer Leaf}`
				? ValueOf<T[Parent & keyof T], Leaf>
				: T[Key & keyof T] extends any[]
					? T[Key & keyof T][number]
					: never
			: never;

const dotPathSymbol = Symbol('dotPath');
const remainSymbol = Symbol('remain');

type IsEmptyTuple<T extends any[]> = 0 extends T['length'] ? true : false;

type BrowserNativeObject = Date | FileList | File;

type KeyChainVal<
	KeyChain extends string | null,
	Key extends string | number | symbol,
	AddStar extends boolean = false,
> = KeyChain extends null
	? `${Key & string}${AddStar extends true ? '*' : ''}`
	: `${KeyChain}.${Key & string}`;

type DotPathValue<
	Val,
	KeyChain extends string | null,
	key extends string | number | symbol,
> = Val extends BrowserNativeObject
	? KeyChainVal<KeyChain, key>
	: Val extends object
		? {
				[dotPathSymbol]: KeyChainVal<KeyChain, key>;
				[remainSymbol]: DotPathObject<Val, KeyChainVal<KeyChain, key>>;
			}
		: KeyChainVal<KeyChain, key>;

type DotPathEmptyTuple<
	T,
	KeyChain extends string | null,
	IgnoreKey extends boolean,
> = T extends any[]
	? T[number] extends BrowserNativeObject
		? KeyChainVal<KeyChain, `${number}`>
		: T[number] extends object
			? {
					[dotPathSymbol]: KeyChainVal<KeyChain, `${number}`>;
					[remainSymbol]: DotPathObject<T[number], KeyChainVal<KeyChain, `${number}`>>;
				}
			: KeyChainVal<KeyChain, `${number}`>
	: // ? DotPathObject<T[number] | 1[], KeyChainVal<KeyChain, `${number}`>, true>
		// : `${KeyChain}${IgnoreKey extends true ? '' : `.${number}`}`
		never;

type DotPathObject<
	T,
	KeyChain extends string | null = null,
	IgnoreKey extends boolean = false,
	StrippedObject = { -readonly [key in keyof T]-?: T[key] },
> =
	Equals<T, object> extends true
		? { [dotPathSymbol]: string }
		: T extends any[]
			? IsEmptyTuple<T> extends true
				? DotPathEmptyTuple<StrippedObject, KeyChain, IgnoreKey>
				: {
						[key in keyof StrippedObject]: DotPathValue<StrippedObject[key], KeyChain, key>;
					}
			: T extends object
				? {
						[key in keyof StrippedObject]: DotPathValue<StrippedObject[key], KeyChain, key>;
					}
				: never;

export type ValueDeep<T> = T extends any[]
	? { [key in keyof T]: ValueDeep<T[key]> }[number]
	: T extends object
		? {
				[key in keyof T]: ValueDeep<T[key]>;
			}[keyof T]
		: T;

export type DotPaths<T> = Equals<T, object> extends true ? string : ValueDeep<CreateStarPaths4<T>>;

export type Validators<O extends object, T extends object> = {
	[key in keyof T]: Extract<T[key], object> extends never
		? ValidatorFn<O, T[key]> | undefined
		: Extract<T[key], Array<any>> extends never
			?
					| (Validators<O, Extract<T[key], object>> & {
							[This]?: ValidatorFn<O, Extract<T[key], object>>;
					  })
					| ValidatorFn<O, Exclude<T[key], object>>
			:
					| Validators<O, Extract<T[key], object>>
					| {
							[This]?: ValidatorFn<O, Extract<T[key], Array<any>>>;
							[All]?: ValidatorFn<O, Extract<T[key], Array<any>>[number]>;
							[Values]?: Validators<O, Extract<T[key], Array<any>>>;
					  }
					| ValidatorFn<O, Exclude<T[key], object>>;
};

export type Validatorss<O extends object, T extends object> = {
	[key in keyof T]: Extract<T[key], object> extends never
		? ValidatorFn<O, T[key]> | undefined
		: Extract<T[key], Array<any>> extends never
			?
					| [
							{ currentObject: ValidatorFn<O, Extract<T[key], object>> },
							Validatorss<O, Extract<T[key], object>>,
					  ]
					| ValidatorFn<O, Exclude<T[key], object>>
			:
					| Validatorss<O, Extract<T[key], object>>
					| [
							{
								current?: ValidatorFn<O, Extract<T[key], Array<any>>>;
								all?: ValidatorFn<O, Extract<T[key], Array<any>>[number]>;
							},
							[Validatorss<O, Extract<T[key], Array<any>>>],
					  ]
					| ValidatorFn<O, Exclude<T[key], object>>;
};

export const thisKey = 'this';
export const This = Symbol(thisKey);

export type PartialValidators<O extends object, T extends object> = {
	[key in keyof T]?: Extract<T[key], object> extends never
		? ValidatorFn<O, T[key]> | undefined
		: Extract<T[key], Array<any>> extends never
			?
					| (Validators<O, Extract<T[key], object>> & {
							[This]?: ValidatorFn<O, Extract<T[key], object>>;
					  })
					| ValidatorFn<O, Exclude<T[key], object>>
			:
					| Validators<O, Extract<T[key], object>>
					| {
							[This]?: ValidatorFn<O, Extract<T[key], Array<any>>>;
							[All]: ValidatorFn<O, Extract<T[key], Array<any>>[number]>;
							[Values]?: Validators<O, Extract<T[key], Array<any>>>;
					  }
					| ValidatorFn<O, Exclude<T[key], object>>;
};

export type PartialValidatorss<O extends object, T extends object> = {
	[K in keyof T]?: Extract<T[K], object> extends never
		? ValidatorFn<O, T[K]>
		: Extract<T[K], Array<any>> extends never
			?
					| [ValidatorFn<O, Extract<T[K], object>>, PartialValidatorss<O, Extract<T[K], object>>]
					| PartialValidatorss<O, Extract<T[K], object>>
			:
					| PartialValidatorss<O, Extract<T[K], Array<any>>>
					| [
							{
								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							},
					  ]
					| [
							{
								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							},
							PartialValidatorss<O, Extract<T[K], Array<any>>>,
					  ];
};

type Obj = { banana?: string; lemon?: string } & { current: never; all: never };
type Test1 = Array<Obj> | [<T extends Obj = Obj>(val: T) => string | false, Array<Obj>];

type Test =
	| [
			{
				current?: <T extends Obj = Obj>(val: T) => string | false;
				all?: <T extends Obj = Obj>(val: T) => string | false;
			},
			Test1,
	  ]
	| Test1
	| undefined;

const test: Test = [{ current: (val) => 'err' }];

type O = {
	firstName: string;
	tester: { banana: string; lemon: string }[];
};

type A<T extends object, O extends object> = {
	[K in keyof T]?: Extract<T[K], object> extends never
		? ValidatorFn<O, T[K]>
		: Extract<T[K], Array<any>> extends never
			?
					| [ValidatorFn<O, T[K]>, A<Extract<T[K], object>, O>]
					| [ValidatorFn<O, T[K]>, A<Extract<T[K], object>, O>, A<Extract<T[K], object>, O>]
					| A<Extract<T[K], object>, O>
			:
					| [
							{
								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							},
							A<Extract<T[K], Array<any>>, O>,
					  ]
					| [
							{
								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							},
					  ]
					| A<Extract<T[K], Array<any>>, O>;
};

const yes: PartialValidatorss<O, O> = {
	firstName: (val) => 'err',
	tester: [{ banana: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
};

type F<V extends object> = {
	initialValues: V;
	validators:
		| PartialValidatorFields<V>
		| ((values: PartialValidatorFields<V>) => PartialValidatorFields<V>);
};

const f: F<O> = {
	initialValues: {
		firstName: 'test',
		tester: [],
	},
	validators: {
		firstName: (val) => 'err',
		tester: [{ banana: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
	},
};

const fn = <T extends object>(f: F<T>): void => {
	return;
};

fn<O>({
	initialValues: {
		firstName: 'test',
		tester: [],
	},
	validators: (vals) => ({
		firstName: () => 'err',
		tester: [{ current: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
	}),
});

type StarPaths<T extends string, R extends string = ''> = T extends `${infer First}.${infer Rest}`
	? R extends ''
		? StarPaths<Rest, First>
		: StarPaths<Rest, `${R}.${First | '*'}`>
	: R extends ''
		? never
		: `${R}.${T}`;

type Paths<T extends string, S extends string> = T extends '' ? S : `${T}.${S}`;

// DotPaths replacement
type CreateStarPaths4<
	T,
	Path extends string = '',
	StrippedObject = T extends object ? { -readonly [K in keyof T]-?: T[K] } : T,
> = StrippedObject extends BrowserNativeObject
	? Path
	: StrippedObject extends Array<infer U>
		? 0 extends StrippedObject['length']
			? CreateStarPaths4<U, Paths<Path, `${number}`>>
			: CreateStarPaths4<U, Path>
		: StrippedObject extends object
			? {
					[K in keyof StrippedObject]: {
						[dotPathSymbol]: Paths<Path, K & string>;
						[remainSymbol]: CreateStarPaths4<StrippedObject[K], Paths<Path, K & string>>;
					};
				}
			: Path;

export const allKey = 'allFields';
export const All = Symbol(allKey);
type DependenciesOnObject<T extends object, S extends Array<any>, TCurrentPath extends string> = {
	[key in keyof T]?: Extract<T[key], object> extends never
		? (
				| Exclude<S[number], TCurrentPath extends '' ? key : `${TCurrentPath}.${key & string}`>
				| StarPaths<S[number]>
			)[]
		:
				| Dependencies<
						Extract<T[key], object>,
						S,
						TCurrentPath extends '' ? key & string : `${TCurrentPath}.${key & string}`
				  >
				| Exclude<T[key], object>;
};
type Dependencies<
	T extends object,
	S extends Array<any>,
	TCurrentPath extends string = '',
	TDepsOnObject = DependenciesOnObject<T, S, TCurrentPath>,
> = T extends any[]
	? { [All]: (S[number] | StarPaths<S[number]>)[]; [Values]?: TDepsOnObject } | TDepsOnObject
	: TDepsOnObject & { [All]?: S | (S[number] | StarPaths<S[number]>)[] };

// type DependencyFieldss<T extends object> = {
// 	[K in keyof T]?: T[K] extends object ? DependencyFieldss<T[K]> : [{ currentObject:  }];
// };

export type DependencyFields<T extends object = object> = Dependencies<T, DotPaths<T>[]>;
export type DependencyFieldsInternal<T extends object = object> = PartialDeep<T, string[]>;
export type BooleanFields<T extends object = object> = ObjectDeep<T, boolean>;
export type ErrorFields<T extends object = object> = PartialDeep<T, string | false>;
export type PartialErrorFields<T extends object> = PartialDeep<T, string | false>;
export type ValidatorFields<T extends object = object> = Validatorss<T, T>;
export type PartialValidatorFields<T extends object> = PartialValidators<T, T>;

export const valuesKey = 'values';
export const Values = Symbol('values');
export const Star = Symbol('*');
export type TriggerObject<T extends object = object> = {
	[Triggers]?: string[];
	[Values]?: T;
	// [Star]?: TriggerFields<T[keyof T]>;
};

export const Triggers = Symbol('triggers');
export type TriggerFields<T extends object = object> = {
	[K in keyof T]?: T[K] extends Array<any>
		? TriggerObject<TriggerFields<T[K]>> & {
				[Star]?: TriggerFields<T[K][number] & object>;
			}
		: T[K] extends object
			? TriggerObject<TriggerFields<T[K]>> & {
					[Star]?: TriggerFields<T[K][keyof T[K]] & object>;
				}
			: string[];
} & {
	[Star]?: T extends Array<any>
		? TriggerFields<T[number] & object>
		: TriggerFields<T[keyof T] & object>;
};

// export type TriggerFieldss<T extends object> = {
// 	[K in keyof T]?: T[K] extends object ? TriggerFieldss<T[K]> : [{currentObject: ''}]
// }

export type ValidatorFn<T extends object = object, V = unknown> = <Value extends V = V>(
	val: Value,
	formState: ValidatorState<T>,
) => string | false | Promise<string | false>;

export type GlobalFormOptions<T extends object> = {
	initialValues: T;
	validateMode?: ValidateMode;
	initialDeps?: Dependencies<T, DotPaths<T>[]>;
	// revalidateMode: ValidateMode;
};
export type FormOptionsSchemaless<T extends object> = {
	initialValidators?:
		| PartialValidatorFields<T>
		| ((values: ReadonlyDeep<T>) => PartialValidatorFields<T>);
	validationResolver?: undefined;
};

export type FormOptionsSchema<T extends object> = {
	validationResolver?: ValidationResolver<T>;
	initialValidators?: undefined;
};
export type FormOptions<T extends object> = GlobalFormOptions<T> &
	(FormOptionsSchemaless<T> | FormOptionsSchema<T>);
export type SyncValidationResolver<T extends object> = (
	values: ReadonlyDeep<T>,
) => PartialErrorFields<T>;
export type AsyncValidationResolver<T extends object> = (
	values: ReadonlyDeep<T>,
) => Promise<PartialErrorFields<T>>;
// export type ValidationResolver<T extends object> = SyncValidationResolver<T> | AsyncValidationResolver<T>;
export type ValidationResolver<T extends object> = (
	values: T,
) => PartialErrorFields<T> | Promise<PartialErrorFields<T>>;

export type ArrayFieldAddOptions<T extends object> = {
	deps?: DotPaths<T>[];
	validate?: boolean;
	validator?: ValidatorFn<T>;
};

type ResetFieldValues<T extends object, TValue> = {
	value: TValue;
	deps?: DotPaths<T>[];
	validator?: ValidatorFn<T, TValue>;
};
export type ResetFieldOptions<T extends object, TValue> =
	| (ResetFieldValues<T, TValue> & {
			keepTouched?: boolean;
			keepDirty?: boolean;
			keepError?: boolean;
			validate?: undefined;
	  })
	| (ResetFieldValues<T, TValue> & {
			keepTouched?: boolean;
			keepDirty?: boolean;
			keepError?: undefined;
			validate?: boolean;
	  });

export type FormUseFieldArray<T extends object, S = unknown> = {
	remove: (index: number) => void;
	append: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	prepend: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
};

export type HandleChangeFn = (
	e: Event & { currentTarget: EventTarget & HTMLInputElement },
) => Promise<void>;

export type UpdateValueFn<T extends object> = <TObject extends T, TPath extends DotPaths<T>>(
	path: TPath,
	value: ValueOf<TObject, TPath & string>,
	options?: {
		validate?: boolean;
		newDeps?: (DotPaths<TObject> | StarPaths<DotPaths<TObject>>)[];
		newValidator?: ValidatorFn<TObject, ValueOf<TObject, TPath & string>>;
	},
) => Promise<void>;

export type HandlerFn<T extends object = object> = <
	TObject extends T,
	Path extends DotPaths<TObject>,
>(
	name: Path,
) => Promise<void>;

export type SubmitFn<T extends object> = (values: T) => void | Promise<void>;

export type ErrorFn<T extends object> = (errors: ErrorFields<T>) => void | Promise<void>;

export type SubmitFormFn<T extends object> = (
	submitFn: SubmitFn<T>,
	errorFn?: ErrorFn<T>,
) => (e: Event) => Promise<void>;

export type ResetFieldFn<T extends object> = <TObject extends T, Path extends DotPaths<TObject>>(
	name: Path,
	options?: ResetFieldOptions<TObject, ValueOf<TObject, Path & string>>,
) => void;

export type ResetFormOptions<T extends object> = {
	values?: T;
	validators?: ValidatorFields<T>;
	deps?: Dependencies<T, DotPaths<T>[]>;
	keepTouched?: boolean;
	keepDirty?: boolean;
	keepErrors?: boolean;
	keepValidators?: boolean;
	keepDeps?: boolean;
};

export type ResetFormFn<T extends object = object> = <TValues extends T>(
	options?: ResetFormOptions<TValues>,
) => void;

export type UseFieldArrayFn<T extends object> = <TObject extends T, Path extends DotPaths<TObject>>(
	name: Path,
) => FormUseFieldArray<TObject, ArrayValueOf<TObject, Path & string>>;

export type UseFieldArrayFnInternal<T extends object = object> = (
	name: string,
) => FormUseFieldArray<T>;

export type RegisterOptions<Path> = {
	name: Path;
};

export type RegisterFn<T extends object> = <Path extends DotPaths<T>>(
	node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	options: RegisterOptions<Path>,
) => { destroy: () => void };

type BeforeOrAfter = 'before' | 'after';
type FieldEvent = 'change' | 'blur' | 'focus' | 'reset' | 'validate';
export type FieldEventHook = `${BeforeOrAfter}${Capitalize<FieldEvent>}`;

export type LatestFieldEvent = {
	field: string | Array<string | number | symbol>;
	event: FieldEventHook;
};

export type ValidateFn<T extends object> = <TPath extends DotPaths<T>>(name: TPath) => void;

export type Form<T extends object = object> = {
	touched: Readable<BooleanFields<T>>;
	values: Writable<T>;
	dirty: Readable<BooleanFields<T>>;
	errors: Readable<ErrorFields<T>>;
	deps: Writable<DependencyFields<T>>;
	state: Readable<FormState>;
	submitForm: SubmitFormFn<T>;
	resetForm: ResetFormFn<T>;
	resetField: ResetFieldFn<T>;
	useFieldArray: UseFieldArrayFn<T>;
	validateMode: Writable<ValidateMode>;
	updateValue: UpdateValueFn<T>;
	handleBlur: HandlerFn<T>;
	handleFocus: HandlerFn<T>;
	control: FormControl<T>;
	initialValues: T;
	initialValidators: ValidatorFields<T>;
	initialDeps: DependencyFields<T>;
	initialTouched: BooleanFields<T>;
	initialDirty: BooleanFields<T>;
	initialErrors: ErrorFields<T>;
	validate: ValidateFn<T>;
	latestFieldEvent: Readable<LatestFieldEvent | null>;
	validators: Writable<ValidatorFields<T>>;
	clean: <TPath extends DotPaths<T>>(path: TPath) => void;
	makeDirty: <TPath extends DotPaths<T>>(path: TPath) => void;
	unBlur: <TPath extends DotPaths<T>>(path: TPath) => void;
	// batch: (fn: (options: FormControl<T>) => void | Promise<void>) => Promise<void>;
};

export type ValidatorState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
	path: string;
};

export type FormControl<T extends object = object> = Omit<Form<T>, 'control'>;
