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

export type PromiseLikeResult<T> = T | Promise<T>;

// export type Fn = (...args: any[]) => any;

export type ObjectDeep<T, S> = T extends Record<PropertyKey, unknown> | any[]
	? {
			[K in keyof T]: ObjectDeep<T[K], S>;
		}
	: S;

export type PartialDeep<T> = T extends Record<PropertyKey, unknown> | any[]
	? {
			[K in keyof T]?: PartialDeep<T[K]>;
		}
	: T;

export type ReadonlyDeep<T> = T extends Record<PropertyKey, unknown> | any[]
	? {
			readonly [K in keyof T]: ReadonlyDeep<T[K]>;
		}
	: T;

export type RequiredDeep<T> = T extends Record<PropertyKey, unknown> | any[]
	? {
			[K in keyof T]-?: RequiredDeep<T[K]>;
		}
	: T;

export type Equals<T, U> =
	(<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? true : false;

export type ValueOf<T, Key extends string> = T extends object
	? Key extends `${infer Parent}.${infer Leaf}`
		? ValueOf<T[Parent & keyof T], Leaf>
		: T[Key & keyof T]
	: never;

// type O = {
// 	firstName: string;
// 	lastName: string;
// 	age: number;
// 	address: {
// 		street: string;
// 		city: string;
// 	};
// 	roles: number | string[];
// };

// export type ArrayValueOf<T, Key extends string> =
// 	Equals<T, object> extends true
// 		? unknown
// 		: T extends object
// 			? Key extends `${infer Parent}.${infer Leaf}`
// 				? ValueOf<T[Parent & keyof T], Leaf>
// 				: T[Key & keyof T] extends any[]
// 					? T[Key & keyof T][number]
// 					: never
// 			: never;

const dotPathSymbol = Symbol('dotPath');
const remainSymbol = Symbol('remain');

type IsEmptyTuple<T extends any[]> = 0 extends T['length'] ? true : false;

type BrowserNativeObject =
	| Date
	| FileList
	| File
	| Uint8Array
	| Uint16Array
	| Uint32Array
	| BigUint64Array
	| Map<any, any>
	| Set<any>
	| WeakMap<any, any>;

type KeyChainVal<
	KeyChain extends string | null,
	Key extends PropertyKey,
	AddStar extends boolean = false,
> = KeyChain extends null
	? `${Key & string}${AddStar extends true ? '*' : ''}`
	: `${KeyChain}.${Key & string}`;

type DotPathValue<
	Val,
	KeyChain extends string | null,
	key extends PropertyKey,
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
	? { [K in keyof T]: ValueDeep<T[K]> }[number]
	: T extends Record<PropertyKey, unknown>
		? {
				[K in keyof T]: ValueDeep<T[K]>;
			}[keyof T]
		: T;

// type A<T extends Record<PropertyKey, unknown>> = T extends never ? true : false;
// type IsConditional<T> = T extends (infer U extends any ? true : false) ? true : false;

// function a<T extends Record<PropertyKey, unknown>>(a: T): A<T> {
// 	console.log(a);
// 	type B = A<T>;
// 	type C = IsConditional<B>;
// 	return undefined as unknown as A<T>;
// }

// type Yes = ReturnType<typeof a>;

export type DotPaths<T extends Record<PropertyKey, unknown> | any[]> =
	Equals<T, object> extends true
		? string
		: Equals<T, Record<PropertyKey, unknown>> extends true
			? string
			: Equals<T, any[]> extends true
				? string
				: ValueDeep<CreateStarPaths4<T>>;
export type ArrayDotPaths<T> =
	Equals<T, object> extends true ? string : ValueDeep<CreateArrayStarPaths4<T>>;

export type Validators<O extends Record<PropertyKey, unknown>, T extends object> = {
	[K in keyof T]: Extract<T[K], object> extends never
		? ValidatorFn<O, T[K]> | undefined
		: Extract<T[K], Array<any>> extends never
			?
					| (Validators<O, Extract<T[K], object>> & {
							[This]?: ValidatorFn<O, Extract<T[K], object>>;
					  })
					| (Exclude<T[K], object> extends never ? never : ValidatorFn<O, Exclude<T[K], object>>)
			:
					| Validators<O, Extract<T[K], object>>
					| {
							[This]?: ValidatorFn<O, Extract<T[K], Array<any>>>;
							[All]?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							[Values]?: Validators<O, Extract<T[K], Array<any>>>;
					  }
					| (Exclude<T[K], object> extends never ? never : ValidatorFn<O, Exclude<T[K], object>>);
};

export type Validatorss<O extends Record<PropertyKey, unknown>, T extends object> = {
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

export type PartialValidators<O extends Record<PropertyKey, unknown>, T extends object> = {
	[K in keyof T]?: Extract<T[K], object> extends never
		? ValidatorFn<O, T[K]> | undefined
		: Extract<T[K], Array<any>> extends never
			?
					| (PartialValidators<O, Extract<T[K], object>> & {
							[This]?: ValidatorFn<O, Extract<T[K], object>>;
					  })
					| (Exclude<T[K], object> extends never ? never : ValidatorFn<O, Exclude<T[K], object>>)
			:
					| PartialValidators<O, Extract<T[K], object>>
					| {
							[This]?: ValidatorFn<O, Extract<T[K], Array<any>>>;
							[All]?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
							[Values]?: Validators<O, Extract<T[K], Array<any>>>;
					  }
					| (Exclude<T[K], object> extends never ? never : ValidatorFn<O, Exclude<T[K], object>>);
};

export type PartialValidatorss<O extends Record<PropertyKey, unknown>, T extends object> = {
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

// type Obj = { banana?: string; lemon?: string } & { current: never; all: never };
// type Test1 = Array<Obj> | [<T extends Obj = Obj>(val: T) => string | false, Array<Obj>];

// type Test =
// 	| [
// 			{
// 				current?: <T extends Obj = Obj>(val: T) => string | false;
// 				all?: <T extends Obj = Obj>(val: T) => string | false;
// 			},
// 			Test1,
// 	  ]
// 	| Test1
// 	| undefined;

// const test: Test = [{ current: (val) => 'err' }];

// type O = {
// 	firstName: string;
// 	tester: { banana: string; lemon: string }[];
// };

// type A<T extends object, O extends object> = {
// 	[K in keyof T]?: Extract<T[K], object> extends never
// 		? ValidatorFn<O, T[K]>
// 		: Extract<T[K], Array<any>> extends never
// 			?
// 					| [ValidatorFn<O, T[K]>, A<Extract<T[K], object>, O>]
// 					| [ValidatorFn<O, T[K]>, A<Extract<T[K], object>, O>, A<Extract<T[K], object>, O>]
// 					| A<Extract<T[K], object>, O>
// 			:
// 					| [
// 							{
// 								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
// 								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
// 							},
// 							A<Extract<T[K], Array<any>>, O>,
// 					  ]
// 					| [
// 							{
// 								current?: ValidatorFn<O, Extract<T[K], Array<any>>>;
// 								all?: ValidatorFn<O, Extract<T[K], Array<any>>[number]>;
// 							},
// 					  ]
// 					| A<Extract<T[K], Array<any>>, O>;
// };

// const yes: PartialValidatorss<O, O> = {
// 	firstName: (val) => 'err',
// 	tester: [{ banana: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
// };

// type F<V extends object> = {
// 	initialValues: V;
// 	validators:
// 		| PartialValidatorFields<V>
// 		| ((values: PartialValidatorFields<V>) => PartialValidatorFields<V>);
// };

// const f: F<O> = {
// 	initialValues: {
// 		firstName: 'test',
// 		tester: [],
// 	},
// 	validators: {
// 		firstName: (val) => 'err',
// 		tester: [{ banana: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
// 	},
// };

// const fn = <T extends object>(f: F<T>): void => {
// 	return;
// };

// fn<O>({
// 	initialValues: {
// 		firstName: 'test',
// 		tester: [],
// 	},
// 	validators: (vals) => ({
// 		firstName: () => 'err',
// 		tester: [{ current: () => 'err', all: () => 'err' }, [{ banana: () => 'lemon' }]],
// 	}),
// });

type Paths<T extends string, S extends string> = T extends '' ? S : `${T}.${S}`;

type TupleKeys<T extends any[]> = Exclude<keyof T, keyof any[]> & string;
// type DP2 = TupleKeys<[1, 2, 3]>;

// Potential dot paths replacement
export type DP<T, Path extends string = ''> =
	T extends Record<PropertyKey, unknown>
		? {
				[K in keyof T]: DP<T[K] | K, Paths<Path, `${Exclude<K, symbol>}`>>;
			}[keyof T]
		: T extends Array<any>
			? 0 extends T['length']
				? DP<T[number] | 1, Paths<Path, `${number}`>>
				: DP<T[number], Paths<Path, TupleKeys<T>>>
			: Path;

// type DPTest = DP<{ a: string; b: number; c: { a: { a: string }[] }; d: [1, 2, 3] }>;

// DotPaths replacement
type CreateStarPaths4<
	T,
	Path extends string = '',
	StrippedObject = T extends object ? { -readonly [K in keyof T]-?: T[K] } : T,
> =
	StrippedObject extends Array<infer U>
		? {
				[dotPathSymbol]: 0 extends StrippedObject['length'] ? Paths<Path, `${number}`> : never;
				[remainSymbol]: 0 extends StrippedObject['length']
					? CreateStarPaths4<U, Paths<Path, `${number}`>>
					: CreateStarPaths4<U, Path>;
			}
		: StrippedObject extends Record<PropertyKey, unknown>
			? {
					[K in keyof StrippedObject]: {
						[dotPathSymbol]: Paths<Path, K & string>;
						[remainSymbol]: CreateStarPaths4<StrippedObject[K], Paths<Path, K & string>>;
					};
				}
			: Path;

type CreateArrayStarPaths4<
	T,
	Path extends string = '',
	StrippedObject = T extends object ? { -readonly [K in keyof T]-?: T[K] } : T,
> =
	StrippedObject extends Array<infer U>
		? {
				[remainSymbol]: 0 extends StrippedObject['length']
					? CreateArrayStarPaths4<U, Paths<Path, `${number}`>>
					: CreateArrayStarPaths4<U, Path>;
			}
		: StrippedObject extends Record<PropertyKey, unknown>
			? {
					[K in keyof StrippedObject]: {
						[dotPathSymbol]: Extract<StrippedObject[K], any[]> extends never
							? never
							: Paths<Path, K & string>;
						[remainSymbol]: CreateArrayStarPaths4<StrippedObject[K], Paths<Path, K & string>>;
					};
				}
			: never;

// type T1 = CreateArrayStarPaths4<{ a: string; b: { value: string }[] }>;
// type T2 = ArrayDotPaths<{
// 	a: string;
// 	b: ({ value: string; metadata: string[] } | string)[] | { a: number; b: boolean };
// }>;

export const allKey = 'allFields';
export const All = Symbol(allKey);

export type BooleanFields<
	T extends Record<PropertyKey, unknown> | any[] = Record<PropertyKey, unknown> | any[],
> = ObjectDeep<T, boolean>;
export type ErrorFields<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> =
	PartialDeep<ObjectDeep<T, string | false>>;
export type PartialErrorFields<T extends Record<PropertyKey, unknown>> = PartialDeep<
	ObjectDeep<T, string | false>
>;
export type ValidatorFields<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> =
	Validators<T, T>;
export type PartialValidatorFields<T extends Record<PropertyKey, unknown>> = PartialValidators<
	T,
	T
>;

export const valuesKey = 'values';
export const Values = Symbol('values');

export type ValidatorFn<
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
	V = unknown,
> = <Value extends V = V>(
	val: Value,
	formState: ValidatorState<T>,
) => string | false | Promise<string | false>;

export type GlobalFormOptions<T extends object> = {
	initialValues: T;
	validateMode?: ValidateMode;
	// revalidateMode: ValidateMode;
};
export type FormOptionsSchemaless<T extends Record<PropertyKey, unknown>> = {
	initialValidators?:
		| PartialValidatorFields<T>
		| ((values: ReadonlyDeep<T>) => PartialValidatorFields<T>);
	validationResolver?: undefined;
};

export type FormOptionsSchema<T extends Record<PropertyKey, unknown>> = {
	validationResolver?: ValidationResolver<T>;
	initialValidators?: undefined;
};
export type FormOptions<T extends Record<PropertyKey, unknown>> = GlobalFormOptions<T> &
	(FormOptionsSchemaless<T> | FormOptionsSchema<T>);
export type SyncValidationResolver<T extends Record<PropertyKey, unknown>> = (
	values: ReadonlyDeep<T>,
) => PartialErrorFields<T>;
export type AsyncValidationResolver<T extends Record<PropertyKey, unknown>> = (
	values: ReadonlyDeep<T>,
) => Promise<PartialErrorFields<T>>;
// export type ValidationResolver<T extends object> = SyncValidationResolver<T> | AsyncValidationResolver<T>;
export type ValidationResolver<T extends Record<PropertyKey, unknown>> = (
	values: T,
) => PartialErrorFields<T> | Promise<PartialErrorFields<T>>;

export type ArrayFieldAddOptions<T extends Record<PropertyKey, unknown>> = {
	validate?: boolean;
	validator?: ValidatorFn<T>;
};

export type ResetFieldOptions<
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
	TPath extends DotPaths<T> = DotPaths<T>,
> = {
	value?: ValueOf<T, TPath>;
	validator?: ValueOf<PartialValidatorFields<T>, TPath>;
	keepTouched?: boolean;
	keepDirty?: boolean;
} & (
	| {
			keepError?: true;
			validate?: false;
	  }
	| {
			keepError?: false;
			validate?: true;
	  }
);

export type FormUseFieldArray<T extends Record<PropertyKey, unknown>, S = unknown> = {
	remove: (index: number) => void;
	append: (value: S, options?: ArrayFieldAddOptions<T>) => Promise<void>;
	prepend: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
};

export type HandleChangeFn = (
	e: Event & { currentTarget: EventTarget & HTMLInputElement },
) => Promise<void>;

export type UpdateValueFn<T extends Record<PropertyKey, unknown>> = <
	TObject extends T,
	TPath extends DotPaths<T>,
>(
	path: TPath,
	value: ValueOf<TObject, TPath & string>,
	options?: {
		validate?: boolean;
		newValidator?: ValueOf<PartialValidatorFields<T>, TPath>;
	},
) => Promise<void>;

export type HandlerFn<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> = <
	TObject extends T,
	Path extends DotPaths<TObject>,
>(
	name: Path,
) => Promise<void>;

export type SubmitFn<T extends object> = (values: T) => void | Promise<void>;

export type ErrorFn<T extends Record<PropertyKey, unknown>> = (
	errors: ErrorFields<T>,
) => void | Promise<void>;

export type SubmitFormFn<T extends Record<PropertyKey, unknown>> = (
	submitFn: SubmitFn<T>,
	errorFn?: ErrorFn<T>,
) => (e: Event) => Promise<void>;

export type ResetFieldFn<T extends Record<PropertyKey, unknown>> = <
	TObject extends T,
	Path extends DotPaths<TObject>,
>(
	name: Path,
	options?: ResetFieldOptions<TObject, Path>,
) => Promise<void>;

export type ResetFormOptions<
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
> = {
	values?: PartialDeep<T>;
	validators?: PartialValidatorFields<T>;
	keepTouched?: boolean;
	keepDirty?: boolean;
	keepErrors?: boolean;
	keepValidators?: boolean;
};

export type ResetFormFn<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> = <
	TValues extends T,
>(
	options?: ResetFormOptions<TValues>,
) => void;

export type UseFieldArrayFn<T extends Record<PropertyKey, unknown>> = <
	TObject extends T,
	Path extends DotPaths<TObject>,
>(
	name: Path,
) => FormUseFieldArray<TObject, Extract<ValueOf<TObject, Path & string>, Array<any>>[number]>;

export type UseFieldArrayFnInternal<
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
> = (name: string) => FormUseFieldArray<T>;

export type RegisterOptions<Path> = {
	name: Path;
};

export type RegisterFn<T extends Record<PropertyKey, unknown>> = <Path extends DotPaths<T>>(
	node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	options: RegisterOptions<Path>,
) => { destroy: () => void };

type BeforeOrAfter = 'before' | 'after';
type FieldEvent = 'change' | 'blur' | 'focus' | 'reset' | 'validate';
export type FieldEventHook = `${BeforeOrAfter}${Capitalize<FieldEvent>}`;

export type LatestFieldEvent = {
	field: string | Array<PropertyKey>;
	event: FieldEventHook;
};

export type ValidateFn<T extends Record<PropertyKey, unknown>> = <TPath extends DotPaths<T>>(
	name: TPath,
) => void;

type Primitive = string | number | boolean | symbol | bigint | null | undefined;

export type SupportedValues =
	| Exclude<Primitive, symbol>
	| Date
	| File
	| Array<SupportedValues>
	| { [K in PropertyKey]: SupportedValues };

export type Form<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> = {
	touched: Readable<BooleanFields<T>>;
	values: Writable<T>;
	dirty: Readable<BooleanFields<T>>;
	errors: Readable<ErrorFields<T>>;
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
	initialTouched: BooleanFields<T>;
	initialDirty: BooleanFields<T>;
	initialErrors: ErrorFields<T>;
	validate: ValidateFn<T>;
	latestFieldEvent: Readable<LatestFieldEvent | null>;
	validators: Writable<ValidatorFields<T>>;
	clean: <TPath extends DotPaths<T>>(path: TPath) => void;
	makeDirty: <TPath extends DotPaths<T>>(path: TPath) => void;
	unBlur: <TPath extends DotPaths<T>>(path: TPath) => void;
};

export type ValidatorState<T extends Record<PropertyKey, unknown>> = {
	values: T;
	path: string;
};

export type FormControl<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> =
	Omit<Form<T>, 'control'>;
