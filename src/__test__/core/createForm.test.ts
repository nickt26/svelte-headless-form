import { render } from '@testing-library/svelte';
// import { readFileSync } from 'fs';
import { get } from 'svelte/store';
import { Project, SyntaxKind, ts, Type, TypeAliasDeclaration } from 'ts-morph';
import { describe, expect, it } from 'vitest';
// import Parser from 'web-tree-sitter';
import { assign } from '../../internal/util/assign';
import { canParseToInt } from '../../internal/util/canParseToInt';
import { clone } from '../../internal/util/clone';
import { mergeRightI } from '../../internal/util/mergeRightDeep';
import { setI } from '../../internal/util/set';
import type { ArrayDotPaths, DotPaths, ValueOf, Form as FormType, ResetFieldOptions, ResetFormOptions, SupportedValues } from '../../types/Form';
import Form from '../components/Form.svelte';
import {
	FormValues,
	getComponentState,
	initialFormValidators,
	initialFormValues,
	waitForAllFieldsToValidate,
} from './createFormUtils';
import type { FormValues as TestFV } from './FormValues';
import { isObject } from '../../internal/util/isObject';
import moment from 'moment';
import {faker} from '@faker-js/faker';

// const parser = new Parser();
// const typescript = await Parser.Language.load('./tree-sitter-typescript.wasm');
// parser.setLanguage(typescript);

// const tree = parser.parse(readFileSync('./FormValues.ts', 'utf-8'));
function getTypeOfProperty(
	typeAlias: TypeAliasDeclaration,
	dotPath: string,
	types: Type<ts.Type>[] = [],
): typeof types {
	if (!typeAlias) return types;

	const type = typeAlias.getType();
	const pathParts = dotPath.split('.');

	let currentType = type;
	// console.log('currentType', currentType.getText());
	let prevIsArray = false;
	for (let i = 0; i < pathParts.length - 1; i++) {
		const part = pathParts[i];
		if (currentType.isUnion() && prevIsArray && canParseToInt(part)) continue;

		if (currentType.isArray()) {
			currentType = currentType.getArrayElementTypeOrThrow();
			prevIsArray = true;
		}

		const property =
			// currentType.isUnion()
			// 	? // TODO: make this fn recursive to deal with unions
			// currentType.getUnionTypes().map((x) => x.getText())
			// :
			currentType.getProperty(part);
		if (!property) return types;

		currentType = property.getTypeAtLocation(typeAlias);
		console.log('currentType', currentType.getText());
	}

	const lastPart = pathParts[pathParts.length - 1];
	if (currentType.isArray() && !currentType.getProperty(lastPart)) {
		console.log('array');

		// return currentType.getArrayElementType()?.getText();
		types.push(currentType.getArrayElementTypeOrThrow());
		return types;
	}

	// return currentType.getProperty(lastPart)?.getTypeAtLocation(typeAlias)?.getText();
	const newType = currentType.getProperty(lastPart)?.getTypeAtLocation(typeAlias);
	if (newType) types.push(newType);
	return types;
}

type Primitive = string | number | boolean | symbol | bigint | null | undefined;

const primitiveValueMapping = {
	string: Math.random() > 0.5 ? faker.lorem.word() : '',
	number: Math.random() > 0.5 ? faker.number.int() : 0,
	boolean: Math.random() > 0.5,
	Date: faker.date.anytime(),
	null: null,
	undefined: undefined,
} satisfies Record<string, SupportedValues>;

function genValue (type: Type<ts.Type>, typeAlias: TypeAliasDeclaration): SupportedValues {
	if (type.isObject()) {
		return type.getProperties().reduce((acc, val) => {
			return Object.defineProperty(acc, val.getName(), {
				value: genValue(val.getTypeAtLocation(typeAlias), typeAlias),
			});
		}, {} as Record<PropertyKey, SupportedValues>);
	} else if (type.isArray()) {
		const elementType = type.getArrayElementTypeOrThrow();
		return [genValue(elementType, typeAlias)];
	} else {
		return primitiveValueMapping[type.getText()];
	}
}

const kindToValue = {
	['object']: (t: Type<ts.ObjectType>) => {
		return t.getProperties().map
	}
};
function getValues(types: Type<ts.Type>[], typeAlias: TypeAliasDeclaration): SupportedValues[] {
	return types.map((x) => genValue(x, typeAlias));
}

describe('getTypeOfProperty', () => {
	const proj = new Project({
		tsConfigFilePath: './tsconfig.json',
		skipFileDependencyResolution: true,
		skipAddingFilesFromTsConfig: true,
		skipLoadingLibFiles: false,
	});
	const sourceFile = proj.addSourceFileAtPath('./src/__test__/core/FormValues.ts');
	const typeAlias = sourceFile.getTypeAlias('FormValues')!;

	it('should get primitive', () => {
		expect(getTypeOfProperty(typeAlias, 'name').map((x) => x.getText())).toEqual([
			'string',
		]);
	});

	it('should get array', () => {
		expect(getTypeOfProperty(typeAlias, 'roles').map((x) => x.getText())).toEqual([
			'string[]',
		]);
	});

	it('should get type of object', () => {
		const types = getTypeOfProperty(typeAlias, 'location.coords');
		expect(
			types.flatMap((x) =>
				x.getProperties().map((x) => {
					return [x.getName(), x.getTypeAtLocation(typeAlias).getText()];
				}),
			),
		).toEqual([
			['lat', 'number'],
			['lng', 'number'],
		]);
	});

	it('should get type of array element', () => {
		const path = 'roles.1';
		const types = getTypeOfProperty(typeAlias, path);
		expect(types.map((x) => x.getText())).toEqual(['string']);
	});

	it('should get type of tuple element', () => {
		const path = 'titles.1';
		const types = getTypeOfProperty(typeAlias, path);

		expect(types.every((x) => x.isLiteral())).toBe(true);
		expect(types.map((x) => x.getText())).toEqual(['"Dr"'] satisfies [
			`"${ValueOf<TestFV, typeof path>}"`,
		]);
	});

	it('should get type of union', () => {
		const path = 'age';
		const types = getTypeOfProperty(typeAlias, path);
		expect(types.every((x) => x.isUnion())).toBe(true);
		expect(types.flatMap((x) => x.getUnionTypes()).map((x) => x.getText())).toEqual([
			'number',
			'Date',
		]);
	});

	it('should log', () => {
		console.log('found type:', getTypeOfProperty(typeAlias, 'location.parts.1.a'));

		// const sourceFile = proj.getSourceFile('./src/__test__/core/FormValues.ts');
		// const type = sourceFile?.getTypeAlias('FormValues');
		const properties = sourceFile?.getTypeAlias('FormValues')?.getChildrenOfKind(SyntaxKind.PropertySignature)
		// const parts = 'roles.1'.split('.');
		// for (let i = 0; i < parts.length; i++) {
		// 	const part = parts[i];
		// 	properties?.forEach((x) => {
		// 		x.isKind(SyntaxKind.ArrayType) {
		// 			x.getType().getArrayElementType()
		// 		}
		// 		if (x.getName() === part) {
		// 			console.log(x.getKindName());
		// 		}
		// 	});
		// }
		// console.log(
		// 	type?.forEachChild((x) => {
		// 		if (x.isKind(SyntaxKind.TypeLiteral)) {
		// 			console.log(x.getKindName());
		// 			x.forEachChild((y) => {
		// 				if (y.isKind(SyntaxKind.PropertySignature)) {
		// 					// console.log(y.getKindName());
		// 					console.log(`${y.getName()}: ${y.getType().getText()}`);

		// 					// y.forEachChild((z) => {
		// 					// 	if (z.isKind(SyntaxKind.Identifier)) {
		// 					// 		console.log(z.getKindName());
		// 					// 	}
		// 					// });
		// 				}
		// 			});
		// 		}
		// 		// console.log(x.getKindName());
		// 	}),
		// );
	});
});

function getDotPaths<
	T extends Record<PropertyKey, unknown> | any[] = Record<PropertyKey, unknown> | any[],
>(obj: T, currPath: string = '', paths: string[] = []): string[] {
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const val = obj[key];
		if (Array.isArray(val) || isObject(val)) {
			getDotPaths(val, currPath ? `${currPath}.${key}` : key, paths);
		} else {
			paths.push(currPath ? `${currPath}.${key}` : key);
		}
	}
	return paths;
}

// type Z<T, U = T> = [T] extends [never] ? [] : T extends infer A ? [A, ...Z<Exclude<U, A>>] : never;

// type ZA = Z<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;

// type B<T extends number> = { [K in T as Exclude<T, K>]: Extract<T, K> } & { length: 2 };
// type IsArray<T> = T extends Array<any> ? true : false;
// type I = IsArray<Array<number> & { a: 'b' }>;
// type IK = (Array<number> & { a: 'b' })[keyof (Array<number> & { a: 'b' })];
// type C<T> = [T, T, T, T] extends [infer A, infer B, infer C, infer D] ? B : never;
// type C1 = C<1 | 2 | 3 | 4>;

// type a = B<1 | 2>;

// type UnionToTuple<T extends string | number, Tuple extends any[] = []> = [T] extends [never]
// 	? Tuple
// 	: {
// 			[K in T]: UnionToTuple<Exclude<T, K>, [...Tuple, K]>;
// 		}[T];
// type UT = UnionToTuple<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>;

// type ArrTest<T extends any[], Tuple extends string[] = []> = {
// 	[K in keyof T]: [K, ...Tuple];
// }[number];
// type TT = ArrTest<[1, 2, 3]>;

// type KeysToTuple<T extends Record<PropertyKey, unknown> | any[]> = T extends any[]
// 	? {
// 			[K in keyof T]: K;
// 		}[number]
// 	: T extends Record<PropertyKey, unknown>
// 		? {
// 				[K in keyof T]: K;
// 			}[keyof T]
// 		: never;
// type KT = KeysToTuple<{ a: 1; b: 2; c: { d: 3 } }>;

// const valueUpdatess = [

// ] satisfies Array<{ key: DotPaths<FormValues>; value: any }>;

function createFuzzyInteractions<T extends Record<PropertyKey, unknown>>(
	form: FormType<T>,
	count: number,
) {
	const formFns = [
		'clean',
		'handleBlur',
		'handleFocus',
		'makeDirty',
		'resetField',
		'resetForm',
		'submitForm',
		'unBlur',
		'updateValue',
		'useFieldArray',
		'validate',
	] as const satisfies Array<keyof FormType<T>>;
	type FormFnOptions = {
		[K in (typeof formFns)[number]]: () => Parameters<FormType<T>[K]>;
	};
	const formFnToOptions = {
		clean: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		handleBlur: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		handleFocus: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		makeDirty: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		validate: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		unBlur: () => {
			const dotPaths = getDotPaths(get(form.values));
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>];
		},
		resetField: () => {
			const dotPaths = getDotPaths(get(form.values));
			const options = [
				'keepDirty',
				'keepError',
				'keepTouched',
				'validate',
				'validator',
				'value',
			] as const satisfies Array<keyof ResetFieldOptions>;
			const invalidOptionCombinations = [{ keepError: true, validate: true }];
			const amountOfOptionsToChoose = Math.floor(Math.random() * options.length);
			const opts = {};
			const chooseOpt = (opt: keyof ResetFieldOptions) => {
				opts[opt] = true;
				if (invalidOptionCombinations.every((x) => Object.keys(x).every((y) => opts[y] === x[y]))) {
					delete opts[opt];
					chooseOpt(options[Math.floor(Math.random() * options.length)]);
				}
			};
			for (let i = 0; i < amountOfOptionsToChoose; i++) {
				chooseOpt(options[Math.floor(Math.random() * options.length)]);
			}
			return [dotPaths[Math.floor(Math.random() * dotPaths.length)] as DotPaths<T>, opts];
		},
		resetForm: () => {
			const options = [
				'keepDirty',
				'keepErrors',
				'keepTouched',
				'keepValidators',
				'validators',
				'values',
			] as const satisfies Array<keyof ResetFormOptions>;
			const count = Math.floor(Math.random() * options.length);
			const opts: ResetFormOptions = {};
			const paths = getDotPaths(get(form.values)) as DotPaths<T>[];
			for (let i = 0; i < count; i++) {
				const opt = options[Math.floor(Math.random() * options.length)];
				if (opt === 'values') {
					const values = generateValues()
					opts[opt] = ;
				}
			}
		},
	} as const satisfies FormFnOptions;
	for (let i = 0; i < count; i++) {
		const rand = Math.floor(Math.random() * formFns.length);
		const fn = formFns[rand];
		const fnOptions = formFnToOptions[fn]();
		const formFn = form[fn];
		interactions.push(formFn(...fnOptions));
	}

	return interactions;
}

it('should work with 1000 fuzzy interactions', () => {
	const { component } = render(Form);
	const { form } = getComponentState(component);
	const fuzzy = createFuzzyInteractions(form, 1000);
});

describe('createForm', async () => {
	it('[Form creation] should have correct initial state', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		expect(get(form.values)).toEqual(initialFormValues);
		expect(get(form.touched)).toEqual(assign(false, initialFormValues));
		expect(get(form.errors)).toEqual({});
		expect(get(form.dirty)).toEqual(assign(false, initialFormValues));
		expect(get(form.validators)).toEqual(initialFormValidators);
		expect(get(form.state)).toEqual({
			isSubmitting: false,
			isValidating: false,
			submitCount: 0,
			hasErrors: false,
			isDirty: false,
			isTouched: false,
			resetCount: 0,
		});
	});

	it('[Form value-change] should not have any errors present', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const valueUpdates: Array<{ key: DotPaths<FormValues>; value: any }> = [
			{ key: 'name', value: 'Test Test' },
			{ key: 'email', value: 'test@test.com' },
			{ key: 'roles.0', value: 'test' },
		];

		const wait = waitForAllFieldsToValidate(valueUpdates, form);

		form.values.update((values) => {
			for (const { key, value } of valueUpdates) {
				setI(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: false, email: false });
		expect(get(form.dirty)).toEqual({
			...form.initialDirty,
			name: true,
			email: true,
			roles: [true],
		});
	});

	it('[Form value-change] should have error for name', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const valueUpdates: Array<{ key: DotPaths<FormValues>; value: any }> = [
			{ key: 'name', value: '' },
			{ key: 'email', value: 'test@test.com' },
		];

		const wait = waitForAllFieldsToValidate(valueUpdates, form);

		form.values.update((values) => {
			for (const { key, value } of valueUpdates) {
				setI(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: 'Required', email: false });
		expect(get(form.dirty)).toEqual({ ...form.initialDirty, name: true, email: true });
	});

	it('[Form value-change] should have error for email', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const valueUpdates: Array<{ key: DotPaths<FormValues>; value: any }> = [
			{ key: 'name', value: 'Test Test' },
			{ key: 'email', value: '' },
		];

		const wait = waitForAllFieldsToValidate(valueUpdates, form);

		form.values.update((values) => {
			for (const { key, value } of valueUpdates) {
				setI(key, value, values);
			}
			return values;
		});

		await wait;

		const values = get(form.values);
		expect(get(form.errors)).toEqual({
			name: form.initialValidators?.name?.(values.name, { path: 'name', values }) ?? false,
			email: 'Required',
		});
		expect(get(form.dirty)).toEqual({ ...form.initialDirty, name: true, email: true });
	});

	it('[Form value-change] should have error for name & email', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const valueUpdates: Array<{ key: DotPaths<FormValues>; value: any }> = [
			{ key: 'name', value: '' },
			{ key: 'email', value: '' },
		];

		const wait = waitForAllFieldsToValidate(valueUpdates, form);

		form.values.update((values) => {
			for (const { key, value } of valueUpdates) {
				setI(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required', roles: [false] });
		expect(get(form.dirty)).toEqual({ name: true, email: true, roles: [false] });
	});

	describe('useFieldArray', () => {
		describe('primitive', () => {
			describe('append', () => {
				it('should append correctly', async () => {
					const { component } = render(Form);
					const { form } = getComponentState(component);

					const arrayPath = 'roles' as const satisfies ArrayDotPaths<FormValues>;
					const rolesHelpers = form.useFieldArray(arrayPath);

					const appendValue = 'admin' satisfies FormValues[typeof arrayPath][number];
					rolesHelpers.append(appendValue);

					expect(get(form.values)).toEqual({
						...form.initialValues,
						roles: [...initialFormValues.roles, 'admin'],
					});
					expect(get(form.touched)).toEqual({
						...form.initialTouched,
						roles: [...form.initialTouched.roles, false],
					});
					expect(get(form.errors)).toEqual(form.initialErrors);
					expect(get(form.dirty)).toEqual({
						...form.initialDirty,
						roles: [...form.initialDirty.roles, false],
					});
					expect(get(form.validators)).toEqual({
						...form.initialValidators,
						roles: get(form.values).roles.map(() => undefined),
					});
				});

				it('should append with { validator }', async () => {
					const { component } = render(Form);
					const { form } = getComponentState(component);

					const arrayPath = 'roles' as const satisfies ArrayDotPaths<FormValues>;
					const rolesHelpers = form.useFieldArray(arrayPath);

					const appendValue = 'admin' satisfies FormValues[typeof arrayPath][number];
					function newValidator() {
						return 'error';
					}
					rolesHelpers.append(appendValue, {
						validator: newValidator,
					});

					expect(get(form.values)).toEqual({
						...form.initialValues,
						roles: [...initialFormValues.roles, 'admin'],
					});
					expect(get(form.touched)).toEqual({ ...form.initialTouched, roles: [false, false] });
					expect(get(form.errors)).toEqual(form.initialErrors);
					expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [false, false] });
					expect(get(form.validators)).toEqual({
						...form.initialValidators,
						roles: [undefined, newValidator],
					});
				});

				it('should append with { validator, validate }', async () => {
					const { component } = render(Form);
					const { form } = getComponentState(component);

					const arrayPath = 'roles' as const satisfies ArrayDotPaths<FormValues>;
					const rolesHelpers = form.useFieldArray(arrayPath);

					const appendValue = 'admin' satisfies FormValues[typeof arrayPath][number];
					function newValidator() {
						return 'error';
					}
					const wait = waitForAllFieldsToValidate(['roles.1'], form);

					rolesHelpers.append(appendValue, {
						validator: newValidator,
						validate: true,
					});

					await wait;

					expect(get(form.values)).toEqual({
						...form.initialValues,
						roles: [...initialFormValues.roles, 'admin'],
					});
					expect(get(form.touched)).toEqual({
						...form.initialTouched,
						roles: [false, ...form.initialTouched.roles],
					});
					expect(get(form.errors)).toEqual({
						...form.initialErrors,
						roles: [
							...mergeRightI(
								form.initialValues.roles.map(() => undefined),
								form.initialErrors.roles,
							),
							newValidator(),
						],
					});
					expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [false, false] });
					expect(get(form.validators)).toEqual({
						...form.initialValidators,
						roles: [
							...(form.initialValidators.roles === undefined
								? form.initialValues.roles.map(() => undefined)
								: Array.isArray(form.initialValidators.roles)
									? form.initialValidators.roles
									: []),
							newValidator,
						],
					});
				});
			});
		});
	});

	it('[Form useFieldArray] should append correctly with all options', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.1'], form);

		const validator = () => 'error';
		rolesHelpers.append('admin', { validate: true, validator });

		await wait;

		expect(get(values).roles).toEqual([...initialFormValues.roles, 'admin']);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, 'error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, validator]);
	});

	it('[Form useFieldArray] should throw error on non-array field', () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		expect(() => useFieldArray('name')).toThrowError('Field (name) is not an array');
	});

	it('[Form useFieldArray] should throw error on non-string name parameter', () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		// @ts-expect-error Testing for incorrect parameter
		expect(() => useFieldArray(1)).toThrowError('name must be a string');
	});

	it('[Form useFieldArray] should prepend correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		rolesHelpers.prepend('admin');

		expect(get(values).roles).toEqual(['admin', ...initialFormValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, false]);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, undefined]);
	});

	it('[Form useFieldArray] should prepend correctly with validate & validator option', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.0'], form);

		const validator = () => 'error';
		rolesHelpers.prepend('admin', { validate: true, validator });

		await wait;

		expect(get(values).roles).toEqual(['admin', ...initialFormValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual(['error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([validator, undefined]);
	});

	it('[Form useFieldArray] should swap correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		rolesHelpers.append('admin');

		const preSwapRolesValues = clone(get(values).roles);
		const preSwapRolesTouched = clone(get(touched).roles);
		const preSwapRolesErrors = clone(get(errors).roles);
		const preSwapRolesDirty = clone(get(dirty).roles);
		const preSwapRolesValidators = clone(get(validators).roles);

		const fromIndex = 0;
		const toIndex = 1;
		rolesHelpers.swap(fromIndex, toIndex);

		expect(get(values).roles).toEqual([preSwapRolesValues[toIndex], preSwapRolesValues[fromIndex]]);
		expect(get(touched).roles).toEqual([
			preSwapRolesTouched[toIndex],
			preSwapRolesTouched[fromIndex],
		]);
		expect(get(errors).roles).toEqual([
			preSwapRolesErrors?.[toIndex],
			preSwapRolesErrors?.[fromIndex],
		]);
		expect(get(dirty).roles).toEqual([preSwapRolesDirty[toIndex], preSwapRolesDirty[fromIndex]]);
		expect(get(validators).roles).toEqual([
			preSwapRolesValidators[toIndex],
			preSwapRolesValidators[fromIndex],
		]);
	});

	it('[Form useFieldArray] swap should throw error on incorrect indices', () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		expect(() => rolesHelpers.swap(1, 0)).toThrowError(`From index (1) is out of bounds`);
		expect(() => rolesHelpers.swap(-1, 0)).toThrowError(`From index (-1) is out of bounds`);

		expect(() => rolesHelpers.swap(0, 1)).toThrowError(`To index (1) is out of bounds`);
		expect(() => rolesHelpers.swap(0, -1)).toThrowError(`To index (-1) is out of bounds`);
	});

	it('[Form useFieldArray] should remove correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		rolesHelpers.prepend('admin');
		rolesHelpers.remove(0);

		expect(get(values)).toEqual(form.initialValues);
		expect(get(touched)).toEqual(form.initialTouched);
		expect(get(errors)).toEqual(form.initialErrors);
		expect(get(dirty)).toEqual(form.initialDirty);
		expect(get(validators)).toEqual(form.initialValidators);
	});

	it('[Form useFieldArray] remove should throw error on incorrect indices', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		expect(() => rolesHelpers.remove(1)).toThrowError(`Index (1) is out of bounds`);
		expect(() => rolesHelpers.remove(-1)).toThrowError(`Index (-1) is out of bounds`);
	});

	// batch(() => {
	// 	$values.firstName = 'Banana';
	// 	blur('firstName');
	// 	clean('firstName');

	// 	blur('lastName');
	// 	unBlur('lastName');

	// 	// values.update((vals) => {
	// 	// 	[firstName, lastName] = [vals.lastName, vals.firstName];
	// 	// 	return {
	// 	// 		...vals,
	// 	// 		firstName,
	// 	// 		lastName
	// 	// 	};
	// 	// });
	// 	[firstName, lastName] = [$values.lastName, $values.firstName];
	// 	updateValue('firstName', firstName);
	// 	$touched.lastName && blur('firstName');
	// 	$dirty.lastName && makeDirty('firstName');
	// 	updateValue('lastName', lastName);
	// 	validate(['firstName', 'lastName']);

	// 	$values = initialValues;
	// 	clean('$');
	// 	unBlur('$');
	// 	$deps = initialDeps;
	// 	$validators = initialValidators;
	// 	clearErrors('$');
	// });

	it('[Form state] should update correctly when changes occur', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		expect(() => rolesHelpers.remove(1)).toThrowError(`Index (1) is out of bounds`);
		expect(() => rolesHelpers.remove(-1)).toThrowError(`Index (-1) is out of bounds`);
	});

	/* TODO: Rewrite entire form api to not have a reset field or reset form method 
	rather have a bunch of smaller methods to undo a change in the form with a 
	batch api that can be used to undo multiple changes at once without causing a jitter between lots of components on the UI
*/
	// TODO: Figure out how to make the batch method work when both values and deps have changed
	it('[Form submission] should update errors and touched state on all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		await form.submitForm(() => {})(new Event('submit'));

		expect(get(form.touched)).toEqual(assign(true, get(form.values)));
		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required', roles: [false] });
	});

	it('banana', async () => {
		// const arr = new Proxy([1, 2, 3], {
		// 	get(target, prop, receiver) {
		// 		console.log('getting', prop, target[prop]);

		// 		return Reflect.get(...arguments);
		// 	},
		// 	set(target, prop, val) {
		// 		console.log('setting', prop, val);

		// 		return Reflect.set(...arguments);
		// 	},
		// });

		// const state: [{ val: string }] = [{ val: 'banana' }];

		// const myFn = (stateRef: [{ val: string }]) => {
		// 	const state = stateRef[0];
		// 	console.log(state);

		// 	setTimeout(() => {
		// 		console.log(state);
		// 	}, 3000);
		// };

		// myFn(state);
		// setTimeout(() => {
		// 	state[0].val = 'apple';
		// }, 1000);

		// arr[2] = 2;
		// arr.push(4); //handled by default setter clone behavior
		// arr.pop(); //handled by length setter check

		// arr.shift(); //handled by length setter check, needs to be batched
		// arr.unshift(0); //handled by length setter check, needs to be batched
		// arr.reverse(); // not handled and needs to be batched
		// arr.sort(); // not handled and needs to be batched
		// arr.splice(0, 1); // handled by length setter check
		// arr.copyWithin(0, 1); //not handled but has to be done in batch to work correctly
		// console.log(arr[0]);

		// const delay = new Promise((resolve) => setTimeout(resolve, 5000));

		// await delay;

		function tester(banana, lemon) {
			return () => {
				console.log('in banana', arguments);
			};
		}

		function Lemon(fn: () => void) {
			this.myvar = 3;
			this.logmyvar = fn;
		}

		const lemon = new Lemon(tester(1, 2));
		lemon.logmyvar();

		const delay = (fn: () => void, ms: number) =>
			new Promise<void>((resolve) => setTimeout(() => resolve(fn()), ms));

		let test = 0;

		const fn = () => {
			console.log('running', test);
			test++;
		};

		const fn2 = () => {
			console.log('running2', test);
			test++;
		};

		delay(fn, 1000);

		delay(fn2, 500);

		console.log('done', test);

		await delay(() => console.log('done delay', test), 1000);

		// expect(arr).toBeDefined();

		// expect(arr).toEqual([1, 2, 2]);
	});
});
