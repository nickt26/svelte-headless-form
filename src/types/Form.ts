import { Readable, Writable } from 'svelte/store';

type Expect<T extends true> = T;
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
	? I
	: never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type IsPrimitive<T> = T extends object ? false : true;

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

// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
// type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

// // TS4.0+
// type Push<T extends any[], V> = [...T, V];

// // TS4.1+
// type UnionToTuple<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
// 	? []
// 	: Push<UnionToTuple<Exclude<T, L>>, L>;

// type TupleToUnion<T extends any[]> = T[number];

// type StringArrayFromDotPath<T extends string, Arr extends string[] = []> = T extends `${infer U}.${infer V}`
// 	? StringArrayFromDotPath<V, [...Arr, U]>
// 	: T extends `${infer U}`
// 	? [...Arr, U]
// 	: never;
export type Equals<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
	? true
	: false;

// type TupleContains<
// 	Tuple extends string[],
// 	Item extends string,
// 	Acc extends 1[] = [],
// > = Tuple[Acc['length']] extends Item
// 	? true
// 	: [1, ...Acc]['length'] extends Tuple['length']
// 	? false
// 	: TupleContains<Tuple, Item, [1, ...Acc]>;
// type KeyIn<T extends object, Key extends string | number | symbol> = Equals<T[Key], unknown> extends true
// 	? false
// 	: true;

// type TypeOfKeyInUnionObjects<
// 	Tuple extends object[],
// 	Key extends string | number | symbol,
// 	TypeTuple extends any[] = [],
// 	Acc extends 1[] = [],
// > = Acc['length'] extends Tuple['length']
// 	? TupleToUnion<TypeTuple>
// 	: KeyIn<Tuple[Acc['length']], Key> extends true
// 	? TypeOfKeyInUnionObjects<Tuple, Key, [Tuple[Acc['length']][Key], ...TypeTuple], [1, ...Acc]>
// 	: TypeOfKeyInUnionObjects<Tuple, Key, TypeTuple, [1, ...Acc]>;
// type TypeOfKeyInObject<Obj extends object, Key extends string | number | symbol> = KeyIn<Obj, Key> extends true
// 	? Obj[Key & keyof Obj]
// 	: never;

// type Test = NestedValueOf<Yes, `nested.roles.${number}.apple`>;

export type ValueOf<T, Key extends string> = Equals<T, object> extends true
	? unknown
	: T extends object
	? Key extends `${infer Parent}.${infer Leaf}`
		? ValueOf<T[Parent & keyof T], Leaf>
		: T[Key & keyof T]
	: never;

export type ArrayValueOf<T, Key extends string> = Equals<T, object> extends true
	? unknown
	: T extends object
	? Key extends `${infer Parent}.${infer Leaf}`
		? ValueOf<T[Parent & keyof T], Leaf>
		: T[Key & keyof T] extends any[]
		? T[Key & keyof T][number]
		: never
	: never;

// type Get<Obj, Path extends DotPath<Obj>> = NestedValueOf<Obj, Path & string>;
// type GetTest = Get<Yes, 'nested.roles.3.banana.1.animal.food.type.amount'>;

// type DotPath<
// 	Obj,
// 	Key = null,
// 	KeyChain extends string | null = null,
// 	SentByArray extends boolean = false,
// 	SentByObject extends boolean = false,
// > = Obj extends any[]
// 	? SentByObject extends true
// 		? DotPath<Obj, Obj[number], `${KeyChain}.${number}`, true>
// 		: SentByArray extends true
// 		? Key extends any[]
// 			? DotPath<Key, Key[number], `${KeyChain}.${number}`, true>
// 			: Key extends object
// 			? DotPath<Key, keyof Key, KeyChain>
// 			: KeyChain
// 		: Key extends null
// 		? `${number}` | DotPath<Obj, Obj[number], `${number}`, true>
// 		:
// 				| DotPath<Obj, Obj[number], KeyChain extends null ? `${number}` : `${KeyChain}.${number}`, true>
// 				| (KeyChain extends null ? never : KeyChain)
// 	: Obj extends object
// 	? SentByObject extends true
// 		? DotPath<Obj, keyof Obj, KeyChain>
// 		: Key extends null
// 		? keyof Obj | DotPath<Obj, keyof Obj>
// 		:
// 				| DotPath<
// 						Obj[Key & keyof Obj],
// 						Obj[Key & keyof Obj] extends any[]
// 							? `${number}`
// 							: Obj[Key & keyof Obj] extends object
// 							? keyof Obj[Key & keyof Obj]
// 							: null,
// 						KeyChain extends null ? Key & string : `${KeyChain}.${Key & string}`,
// 						false,
// 						Obj[Key & keyof Obj] extends object ? false : true
// 				  >
// 				| (KeyChain extends null ? never : KeyChain)
// 	: KeyChain;

const dotPathSymbol = Symbol('dotPath');
const remainSymbol = Symbol('remain');
const starSymbol = Symbol('star');

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
> = Equals<T, object> extends true
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

type ValueDeep<T> = T extends any[]
	? { [key in keyof T]: ValueDeep<T[key]> }[number]
	: T extends object
	? {
			[key in keyof T]: ValueDeep<T[key]>;
	  }[keyof T]
	: T;

export type DotPaths<T> = ValueDeep<DotPathObject<T>>;

// type SimpleObj = {
// 	a: {
// 		b: string;
// 		c: number;
// 		d: {
// 			e: boolean;
// 			f: true;
// 		};
// 	};
// 	form: {
// 		roles:
// 			| [
// 					[{ user: { firstName: string; lastName: string } }],
// 					{ username: string } | { banana: boolean },
// 					{ age: number; gender: string },
// 					[string],
// 			  ]
// 			| { username: string }
// 			| number[];
// 		bake: number[];
// 	};
// };
// type Yes =
// 	| {
// 			nested:
// 				| {
// 						roles: [
// 							{ banana: { lemon: true } },
// 							1,
// 							{ banana: number; apple: true | { lemon: string } },
// 							{
// 								banana: [
// 									{ person: string },
// 									{
// 										animal: {
// 											numOfLegs: 2 | 4;
// 											type: 'mammal' | 'reptile';
// 											food: { name: 'lemon' | 'orange'; type: { name: string; amount: number } };
// 										};
// 									},
// 									boolean,
// 								];
// 							},
// 							{ apple: number },
// 						];
// 				  }
// 				| number;
// 			roles: [{ type: 'cat' }];
// 			age: number;
// 			gender: string;
// 			height: number;
// 			weight: number;
// 	  }
// 	| number
// 	| null;

// type simpleobjtest = DotPathObject<object>;
// type dotpathtest = ValueDeep<simpleobjtest>;
// const dotpathtest: dotpathtest = `roles.0.type`;

export type Validators<O extends object, T extends object> = {
	[key in keyof T]: Extract<T[key], object> extends never
		? ValidatorFn<O, T[key]> | undefined
		: Validators<O, Extract<T[key], object>> | ValidatorFn<O, Exclude<T[key], object>>;
};
export type PartialValidators<O extends object, T extends object> = {
	[key in keyof T]?: Extract<T[key], object> extends never
		? ValidatorFn<O, T[key]>
		: PartialValidators<O, Extract<T[key], object>> | ValidatorFn<O, Exclude<T[key], object>>;
};

type Test<T> = T extends [...infer R, infer L] ? L : never;
type Test2 = Test<['a', 'b', 'c']>;

type Test3<T extends any[], S extends any[]> =
	| T[number]
	| (S extends [...infer R, 'f'] ? R[number] : never);
type Test4 = Test3<['a', 'b', 'c'], ['d', 'e', 'f']>;

type MeTest<T extends string> = T extends `${infer F}.${infer R}`
	? R
	: T extends `${infer F}`
	? F
	: never;
type MeTest1 = MeTest<`a.${number}`>;

type ReplaceOn<
	TReplacement extends string | number,
	TToReplace extends string,
	TString extends string,
	TRes extends string = '',
> = TString extends `${infer R}${TToReplace}${infer L}`
	? ReplaceOn<
			TReplacement,
			TToReplace,
			L,
			`${TRes extends '' ? TRes : `${TRes}${TReplacement}`}${R}`
	  >
	: `${TRes extends '' ? TRes : `${TRes}${TReplacement}`}${TString}`;
type TestReplaceOn = ReplaceOn<'.*.', '.', ['a.d.e', 'b.a', 'c', `f.${number}`][number]>;

type FormValues = {
	// firstName: string;
	// lastName: string;
	// age: number;
	// allRolesAreUnique: boolean;
	extra: {
		location: {
			lat: number;
			lng: number;
			address: {
				unitNumber?: string;
				streetNumber: string;
				streetName: string;
				suburb: string;
				city: string;
				postCode: string;
			};
		};
		roles: { value: string; label: string }[] | string[];
	};
	middleNames: string[];
};

type CreateStarPaths<
	TString extends string,
	TRes extends string = '',
> = TString extends `${infer First}.${infer Rest}`
	? Rest extends `${number}`
		? CreateStarPaths<'', `${TRes extends '' ? TRes : `${TRes}.`}${First}`>
		: CreateStarPaths<Rest, `${TRes extends '' ? TRes : `${TRes}.`}${First}.*`>
	: TRes extends ''
	? never
	: TRes;
// : `${TRes extends '' ? TRes : `${TRes}.*.`}${TString}`;
// type DotPathsTest = DotPaths<FormValues>;
type TestCreateStarPaths = CreateStarPaths<
	'a.b.c.d' | 'a.b.c' | 'a.b' | 'a' | `a.${number}` | `a.${number}.${number}` | `a.b.${number}`
>;

type CreateStarPaths2<
	TForm extends object,
	TString extends string,
	TRes extends string = '',
> = TString extends `${infer First}.${infer Rest}`
	? Rest extends `${infer NextFirst}.${infer NextRest}`
		? CreateStarPaths2<TForm, NextRest, `${TRes extends '' ? TRes : `${TRes}.`}${First}.*`>
		: `${TRes extends '' ? TRes : `${TRes}.`}${First}.*`
	: TRes extends ''
	? never
	: `${TRes}.${TString}`;

type ReplaceMiddlePathsWithStar<
	TString extends string,
	TRes extends string = '',
> = TString extends `${infer First}.${infer Rest}`
	? Rest extends `${infer RestFirst}.${infer RestNext}`
		? TRes extends ''
			? ReplaceMiddlePathsWithStar<Rest, `${First}.*`>
			: ReplaceMiddlePathsWithStar<Rest, `${TRes}.*`>
		: TRes extends ''
		? never
		: `${TRes}.${Rest}`
	: TRes extends ''
	? never
	: `${TRes}.${TString}`;

type ReplaceRightWithStarAndDropLast<
	TString extends string,
	TRes extends string = '',
> = TString extends `${infer First}.${infer Rest}`
	? Rest extends `${infer RestFirst}.${infer RestNext}`
		? TRes extends ''
			? ReplaceMiddlePathsWithStar<Rest, `${First}.*`>
			: ReplaceMiddlePathsWithStar<Rest, `${TRes}.*`>
		: TRes extends ''
		? never
		: `${TRes}.${Rest}`
	: TRes extends ''
	? never
	: `${TRes}.${TString}`;

type RemoveLastPath<
	TPath extends string,
	TResult extends string = '',
> = TPath extends `${infer First}.${infer Rest}`
	? RemoveLastPath<Rest, `${TResult extends '' ? '' : `${TResult}.`}${First}`>
	: TResult;

type RemoveLastPathTest = RemoveLastPath<'a.b'>;
type FinalPath<
	TPath extends string,
	TPathWithLastRemoved extends string,
> = TPath extends `${TPathWithLastRemoved}.${infer Last}` ? Last : never;
type FinalPathTest = FinalPath<'a.b.c', RemoveLastPath<'a.b.c'>>;

type StarPaths<T extends string, R extends string = ''> = T extends `${infer First}.${infer Rest}`
	? R extends ''
		? StarPaths<Rest, First>
		: StarPaths<Rest, `${R}.${First | '*'}`>
	: `${R}.${T}`;
// type StarPaths<
// 	T extends string,
// 	Paths extends string[] = [],
// 	CountTracker extends 1[] = [],
// 	Result extends string[] = [],
// 	LastPathIndex extends number = CountTracker['length'],
// > = T extends `${infer First}.${infer Rest}`
// 	? StarPaths<
// 			Rest,
// 			[
// 				...Paths,
// 				IsFirstIteration<Paths> extends true ? `${First}` : `${Paths[LastPathIndex]}.${First}`,
// 			],
// 			IsFirstIteration<Paths> extends true ? [] : [...CountTracker, 1],
// 			[
// 				...Result,
// 				IsFirstIteration<Paths> extends true
// 					? never
// 					: `${First}` | ReplaceMiddlePathsWithStar<Paths[number]>,
// 			]
// 	  >
// : [...Result, ReplaceMiddlePathsWithStar<Paths[number] | `${Paths[LastPathIndex]}.${T}`>][number];
//   `${Result[number]}.${T}`;

type StarPathsTest = StarPaths<'a.b.c.d.e'>;

type ReplaceMiddlePathsWithStarTest = ReplaceMiddlePathsWithStar<'a.b.c.d'>;
type CreateStarPaths3<
	TForm,
	TPath extends string,
	TRes extends string = '',
	TPathValue extends ValueOf<TForm, TPath> = ValueOf<TForm, TPath>,
	TPathValueUnionIncludesPrimitive extends boolean = Exclude<TPathValue, object> extends never
		? false
		: true,
	TPathWithLastRemoved extends string = RemoveLastPath<TPath>,
	TFinalPath extends string = FinalPath<TPath, TPathWithLastRemoved>,
> = TPathValueUnionIncludesPrimitive extends true
	? TFinalPath extends `${number}`
		? never
		: ReplaceMiddlePathsWithStar<TPath>
	: never;
type TestCreateStarPaths3 = CreateStarPaths3<FormValues, DotPaths<FormValues>>;
type TestCreateStarPaths2 = CreateStarPaths2<
	object,
	'a.b.c.d' | 'a.b.c' | 'a.b' | 'a' | `a.${number}` | `a.${number}.${number}` | `a.b.${number}`
>;

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
// {	[K in keyof StrippedObject]: StrippedObject[K] extends BrowserNativeObject
// 		? Paths<Path, K & string>
// 		: StrippedObject[K] extends Array<infer U>
// 		? StrippedObject[K]['length'] extends 0
// 			? U extends BrowserNativeObject
// 				? Paths<Path, `${K & string}.${number}`> | Paths<Path, K & string>
// 				: U extends object
// 				? {
// 						[dotPathSymbol]: Paths<Path, K & string>;
// 						[remainSymbol]: CreateStarPaths4<U, Paths<Path, `${K & string}.${number}`>>;
// 				  }
// 				: Paths<Path, K & string> | Paths<Path, `${K & string}.${number}`>
// 			: U extends BrowserNativeObject
// 			? Paths<Path, K & string>
// 			: U extends object
// 			? {
// 					[dotPathSymbol]: Paths<Path, K & string>;
// 					[remainSymbol]: CreateStarPaths4<U, Paths<Path, K & string>>;
// 			  }
// 			: Paths<Path, K & string>
// 		: StrippedObject[K] extends object
// 		? {
// 				[dotPathSymbol]: Paths<Path, K & string>;
// 				[remainSymbol]: CreateStarPaths4<StrippedObject[K], Paths<Path, K & string>>;
// 		  }
// 		: Paths<Path, K & string>;
// };
type CreateStarPaths5<
	T,
	Path extends string = '',
	StarPath extends string = '',
	StrippedObject = T extends object ? { -readonly [K in keyof T]-?: T[K] } : T,
> = StrippedObject extends BrowserNativeObject
	? StarPath
	: StrippedObject extends Array<infer U>
	? 0 extends StrippedObject['length']
		? U extends object
			? {
					[dotPathSymbol]: Paths<Path, '*'>;
					a: Paths<StarPath, `${number}`>;
					[remainSymbol]: CreateStarPaths5<U, Paths<Path, `${number}`>, Paths<Path, '*'>>;
			  }
			: CreateStarPaths5<U, Paths<Path, `${number}`>, StarPath>
		: U extends object
		? {
				[dotPathSymbol]: Paths<Path, '*'>;
				a: Paths<StarPath, `${number}`>;
				[remainSymbol]: CreateStarPaths5<U, Path, Paths<Path, '*'>>;
		  }
		: CreateStarPaths5<U, Path, StarPath>
	: StrippedObject extends object
	? {
			[K in keyof StrippedObject]: StrippedObject[K] extends object
				? {
						// [dotPathSymbol]: Paths<Paths<Path, K & string>, '*'>;
						a: Paths<StarPath, K & string>;
						[remainSymbol]: CreateStarPaths5<
							StrippedObject[K],
							Paths<Path, K & string>,
							Paths<Paths<Path, K & string>, '*'>
						>;
				  }
				: {
						[dotPathSymbol]: Paths<Paths<Path, K & string>, '*'>;
						// [dotPathSymbol]: Paths<Path, K & string>;
						a: Paths<StarPath, K & string>;
						[remainSymbol]: CreateStarPaths5<StrippedObject[K], Paths<Path, K & string>, StarPath>;
				  };
	  }
	: StarPath;

type Test5<T extends string[], TRes extends string[] = []> = T extends any[]
	? T extends [...infer R, infer L]
		? Test5<R, [...TRes, `${L & string}.*`]>
		: TRes[number]
	: never;
type Test6 = Test5<['a.d.e', 'b.a', 'c']>;

export const AllFields = Symbol('special');
type DependenciesOnObject<T extends object, S, TCurrentPath extends string> = {
	[key in keyof T]?: Extract<T[key], object> extends never
		? Exclude<S[number], TCurrentPath extends '' ? key : `${TCurrentPath}.${key & string}`>[][]
		:
				| Dependecies<
						Extract<T[key], object>,
						S,
						TCurrentPath extends '' ? key : `${TCurrentPath}.${key & string}`
				  >
				| Exclude<T[key], object>;
};
type Dependecies<
	T extends object,
	S,
	TCurrentPath extends string = '',
	TDepsOnObject = DependenciesOnObject<T, S, TCurrentPath>,
> = T extends any[]
	? { [AllFields]: S; values?: TDepsOnObject } | TDepsOnObject
	: TDepsOnObject & { [AllFields]?: S };

export type DependencyFields<T extends object = object> = Dependecies<T, DotPaths<T>[]>;
export type DependencyFieldsInternal<T extends object = object> = PartialDeep<T, string[]>;
export type BooleanFields<T extends object = object> = ObjectDeep<T, boolean>;
export type ErrorFields<T extends object = object> = ObjectDeep<T, string | false>;
export type PartialErrorFields<T extends object> = PartialDeep<T, string | false>;
export type ValidatorFields<T extends object = object> = Validators<T, T>;
export type PartialValidatorFields<T extends object> = PartialValidators<T, T>;

export type TriggerObject<T extends object = object> = {
	triggers?: string[];
	values?: T;
};
export type TriggerFields<T extends object> = {
	[Key in keyof T]?: Extract<T[Key], object> extends never
		? string[]
		: TriggerObject<TriggerFields<Extract<T[Key], object>>>;
};

export type ValidatorFn<T extends object = object, V = unknown> = <Value extends V = V>(
	val: Value,
	formState: ValidatorFormState<T>,
) => string | false | Promise<string | false>;
// export type AsyncValidatorFn<T extends object = object, V = unknown> = <Value extends V = V>(
// 	val: Value,
// 	formState: ReadonlyDeep<ValidatorFormState<T>>,
// ) => Promise<string | false>;

export type GlobalFormOptions<T extends object> = {
	initialValues: T;
	validateMode?: ValidateMode;
	initialDeps?: PartialDeep<T, DotPaths<T>[]>;
	// revalidateMode: ValidateMode;
};
export type FormOptionsSchemaless<T extends object> = GlobalFormOptions<T> & {
	initialValidators?:
		| PartialValidatorFields<T>
		| ((values: ReadonlyDeep<T>) => PartialValidatorFields<T>);
};

export type FormOptionsSchema<T extends object> = GlobalFormOptions<T> & {
	validationResolver?: ValidationResolver<T>;
};
export type FormOptions<T extends object> = GlobalFormOptions<T> &
	(
		| Pick<FormOptionsSchemaless<T>, 'initialValidators'>
		| Pick<FormOptionsSchema<T>, 'validationResolver'>
	);
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
	deps?: string[];
	validate?: boolean;
	validator?: ValidatorFn<T>;
};

type ResetFieldValues<T extends object, Val> = {
	value: Val;
	deps?: DotPaths<T>[];
	validator?: ValidatorFn<T, Val>;
};
type ResetFieldRetains = {
	keepTouched?: boolean;
	keepValidator?: boolean;
	keepValue?: boolean;
	keepDeps?: boolean;
	keepError?: boolean;
	keepDirty?: boolean;
	keepDependentErrors?: boolean;
};
export type ResetFieldOptions<T extends object, Val> = ResetFieldRetains & ResetFieldValues<T, Val>;

export type FormUseFieldArray<T extends object, S = unknown> = {
	remove: (index: number) => void;
	append: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	prepend: (value: S, options?: ArrayFieldAddOptions<T>) => void;
	swap: (from: number, to: number) => void;
};

// export type Field<T extends object> = {
// 	handleChange: <Obj extends T, Path extends DotPath<T>>(path: Path, value: NestedValueOf<Obj, Path & string>) => void;
// 	handleBlur: (name: string) => void;
// 	handleFocus: (name: string) => void;
// };

export type HandleChangeFn = (
	e: Event & { currentTarget: EventTarget & HTMLInputElement },
) => Promise<void>;

export type UpdateValueFn<T extends object> = <TObject extends T, Path extends DotPaths<T>>(
	path: Path,
	value: ValueOf<TObject, Path & string>,
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
	values: T;
	validators?: ValidatorFields<T>;
	deps?: PartialDeep<T, DotPaths<T>[]>;
};

export type ResetFormFn<T extends object> = <TValues extends T>(
	options?: ResetFormOptions<TValues>,
) => void;

export type UseFieldArrayFn<T extends object> = <Path extends DotPaths<T>>(
	name: Path,
) => FormUseFieldArray<T, ArrayValueOf<T, Path & string>>;

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
	field: string;
	event: FieldEventHook;
};

export type ValidateFn<T extends object> = <Path extends DotPaths<T>>(name: Path) => void;

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
	// field: Field<T>;
	handleChange: HandleChangeFn;
	updateValue: UpdateValueFn<T>;
	handleBlur: HandlerFn<T>;
	handleFocus: HandlerFn<T>;
	register: RegisterFn<T>;
	control: FormControl<T>;
	initialValues: T;
	initialValidators: ValidatorFields<T>;
	initialDeps: DependencyFields<T>;
	validate: ValidateFn<T>;
	latestFieldEvent: Readable<LatestFieldEvent>;
	validators: Writable<ValidatorFields<T>>;
};

export type ValidatorFormState<T extends object> = {
	values: T;
	dirty: BooleanFields<T>;
	errors: ErrorFields<T>;
	touched: BooleanFields<T>;
};

export type FormControl<T extends object = object> = Omit<Form<T>, 'control'>;
