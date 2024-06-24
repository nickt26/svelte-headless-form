import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { clone } from '../../internal/util/clone';
import { setImpure } from '../../internal/util/set';
import { DotPaths } from '../../types/Form';
import Form from '../components/Form.svelte';
import {
	FormValues,
	formValidators,
	formValues,
	getComponentState,
	waitForAllFieldsToValidate,
} from './createFormUtils';

describe('createForm', async () => {
	it('[Form creation] should have correct initial state', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		expect(get(form.values)).toEqual(formValues);
		expect(get(form.touched)).toEqual({ name: false, email: false, roles: [false] });
		expect(get(form.errors)).toEqual({ name: false, email: false, roles: [false] });
		expect(get(form.dirty)).toEqual({ name: false, email: false, roles: [false] });
		expect(get(form.deps)).toEqual({ name: [], email: [], roles: [[]] });
		expect(get(form.validators)).toEqual({ ...formValidators, roles: [undefined] });
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
				setImpure(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: false, email: false, roles: [false] });
		expect(get(form.dirty)).toEqual({ name: true, email: true, roles: [true] });
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
				setImpure(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: 'Required', email: false, roles: [false] });
		expect(get(form.dirty)).toEqual({ name: true, email: true, roles: [false] });
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
				setImpure(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: false, email: 'Required', roles: [false] });
		expect(get(form.dirty)).toEqual({ name: true, email: true, roles: [false] });
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
				setImpure(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required', roles: [false] });
		expect(get(form.dirty)).toEqual({ name: true, email: true, roles: [false] });
	});

	it('[Form handleBlur] should blur name field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		await handleBlur('name');

		expect(get(touched)).toEqual({ name: true, email: false, roles: [false] });
	});

	it('[Form handleBlur] should blur email field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		await handleBlur('email');

		expect(get(touched)).toEqual({ name: false, email: true, roles: [false] });
	});

	it('[Form handleBlur] should blur all array fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		await handleBlur('roles');

		expect(get(touched)).toEqual({ name: false, email: false, roles: [true] });
	});

	it("[Form handleBlur] should run validation on validateMode = 'onBlur'", async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur, validateMode, validators, errors } = form;
		validateMode.set('onBlur');

		validators.update((vals) => ({ ...vals, roles: [() => 'error'] }));

		await handleBlur('roles.0');

		expect(get(touched)).toEqual({ name: false, email: false, roles: [true] });
		expect(get(errors)).toEqual({ name: false, email: false, roles: ['error'] });
	});

	it('[Form handleBlur] should do nothing on incorrect path', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur, validateMode, validators, errors } = form;

		// @ts-expect-error
		await handleBlur('fake');

		expect(get(touched)).toEqual({ name: false, email: false, roles: [false] });
	});

	it('[Form handleBlur] touched values should be true for all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		await handleBlur('name');
		expect(get(touched)).toEqual({ name: true, email: false, roles: [false] });
		await handleBlur('email');
		expect(get(touched)).toEqual({ name: true, email: true, roles: [false] });
		await handleBlur('roles.0');

		expect(get(touched)).toEqual({ name: true, email: true, roles: [true] });
	});

	it('[Form useFieldArray] should append correctly with no options', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		rolesHelpers.append('admin');

		expect(get(values).roles).toEqual([...formValues.roles, 'admin']);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, false]);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, undefined]);
		expect(get(deps).roles).toEqual([[], []]);
	});

	it('[Form useFieldArray] should append correctly with deps option', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		rolesHelpers.append('admin', { deps: ['email'] });

		expect(get(values).roles).toEqual([...formValues.roles, 'admin']);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, false]);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, undefined]);
		expect(get(deps).roles).toEqual([[], ['email']]);
	});

	it('[Form useFieldArray] should append correctly with validate & validator option', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.1'], form);

		const validator = () => 'error';
		rolesHelpers.append('admin', { validate: true, validator });

		await wait;

		expect(get(values).roles).toEqual([...formValues.roles, 'admin']);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, 'error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, validator]);
		expect(get(deps).roles).toEqual([[], []]);
	});

	it('[Form useFieldArray] should append correctly with all options', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.1'], form);

		const validator = () => 'error';
		rolesHelpers.append('admin', { validate: true, validator, deps: ['email'] });

		await wait;

		expect(get(values).roles).toEqual([...formValues.roles, 'admin']);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, 'error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, validator]);
		expect(get(deps).roles).toEqual([[], ['email']]);
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

		// @ts-ignore
		expect(() => useFieldArray(1)).toThrowError('name must be a string');
	});

	it('[Form useFieldArray] should prepend correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		rolesHelpers.prepend('admin');

		expect(get(values).roles).toEqual(['admin', ...formValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, false]);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, undefined]);
		expect(get(deps).roles).toEqual([[], []]);
	});

	it('[Form useFieldArray] should prepend correctly with deps option', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		rolesHelpers.prepend('admin', { deps: ['email'] });

		expect(get(values).roles).toEqual(['admin', ...formValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual([false, false]);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([undefined, undefined]);
		expect(get(deps).roles).toEqual([['email'], []]);
	});

	it('[Form useFieldArray] should prepend correctly with validate & validator option', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.0'], form);

		const validator = () => 'error';
		rolesHelpers.prepend('admin', { validate: true, validator });

		await wait;

		expect(get(values).roles).toEqual(['admin', ...formValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual(['error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([validator, undefined]);
		expect(get(deps).roles).toEqual([[], []]);
	});

	it('[Form useFieldArray] should prepend correctly with all options', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');

		const wait = waitForAllFieldsToValidate(['roles.0'], form);

		const validator = () => 'error';
		rolesHelpers.prepend('admin', { deps: ['email'], validate: true, validator });

		await wait;

		expect(get(values).roles).toEqual(['admin', ...formValues.roles]);
		expect(get(touched).roles).toEqual([false, false]);
		expect(get(errors).roles).toEqual(['error']);
		expect(get(dirty).roles).toEqual([false, false]);
		expect(get(validators).roles).toEqual([validator, undefined]);
		expect(get(deps).roles).toEqual([['email'], []]);
	});

	it('[Form useFieldArray] should swap correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		rolesHelpers.append('admin');

		const preSwapRolesValues = clone(get(values).roles);
		const preSwapRolesTouched = clone(get(touched).roles);
		const preSwapRolesErrors = clone(get(errors).roles);
		const preSwapRolesDirty = clone(get(dirty).roles);
		const preSwapRolesValidators = clone(get(validators).roles);
		const preSwapRolesDeps = clone(get(deps).roles!);

		const fromIndex = 0;
		const toIndex = 1;
		rolesHelpers.swap(fromIndex, toIndex);

		expect(get(values).roles).toEqual([preSwapRolesValues[toIndex], preSwapRolesValues[fromIndex]]);
		expect(get(touched).roles).toEqual([
			preSwapRolesTouched[toIndex],
			preSwapRolesTouched[fromIndex],
		]);
		expect(get(errors).roles).toEqual([preSwapRolesErrors[toIndex], preSwapRolesErrors[fromIndex]]);
		expect(get(dirty).roles).toEqual([preSwapRolesDirty[toIndex], preSwapRolesDirty[fromIndex]]);
		expect(get(validators).roles).toEqual([
			preSwapRolesValidators[toIndex],
			preSwapRolesValidators[fromIndex],
		]);
		expect(get(deps).roles).toEqual([preSwapRolesDeps[toIndex], preSwapRolesDeps[fromIndex]]);
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

		const { values, touched, errors, dirty, validators, deps, useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		rolesHelpers.remove(0);

		expect(get(values).roles).toEqual([]);
		expect(get(touched).roles).toEqual([]);
		expect(get(errors).roles).toEqual([]);
		expect(get(dirty).roles).toEqual([]);
		expect(get(validators).roles).toEqual([]);
		expect(get(deps).roles).toEqual([]);
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

		expect(get(form.touched)).toEqual({ name: true, email: true, roles: [true] });
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
