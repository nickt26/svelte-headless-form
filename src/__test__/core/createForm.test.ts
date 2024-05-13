import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { clone } from '../../internal/util/clone';
import { isObject } from '../../internal/util/isObject';
import { setImpure } from '../../internal/util/set';
import { DotPaths, PartialValidatorFields, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';

type FormValues = {
	name: string;
	email: string;
	roles: string[];
};

export const formValues: FormValues = {
	name: '',
	email: '',
	roles: ['user'],
};

export const formValidators: PartialValidatorFields<FormValues> = {
	name: (value) => value.length === 0 && 'Required',
	email: (value) => value.length === 0 && 'Required',
};

function getComponentState(component: Form) {
	return component.$capture_state() as unknown as { form: FormType<FormValues> };
}

type ValueUpdate = Array<{ key: DotPaths<FormValues>; value: any }>;

function waitForAllFieldsToValidate(
	valueUpdates: ValueUpdate | Array<DotPaths<FormValues>>,
	form: FormType<FormValues>,
): Promise<void> {
	const { latestFieldEvent } = form;
	return new Promise<void>((resolve) => {
		const fieldsThatHaveValidated: (string | (string | number | symbol)[])[] = [];
		const unsub = latestFieldEvent.subscribe(async (x) => {
			if (
				x?.event === 'afterValidate' &&
				valueUpdates.some(
					(val: { key: DotPaths<FormValues>; value: any } | DotPaths<FormValues>) => {
						const path = Array.isArray(x.field) ? x.field.join('.') : x.field;
						if (isObject(val)) {
							return val.key === path;
						}

						if (typeof val === 'string') {
							return val === path;
						}
					},
				)
			) {
				fieldsThatHaveValidated.push(x.field);
				if (fieldsThatHaveValidated.length === valueUpdates.length) {
					unsub();
					resolve();
				}
			}
		});
	});
}

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

	it('[Form resetField primitive] should reset field correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { resetField, values, deps, errors, dirty, touched, validators } = form;

		const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];

		deps.update((deps) => {
			for (const { key } of valueUpdate) {
				setImpure(key, ['email'], deps);
			}
			return deps;
		});

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		expect(get(values).name).toEqual('Test Test');
		expect(get(deps).name).toEqual(['email']);

		resetField('name');

		expect(get(values).name).toEqual('');
		expect(get(touched).name).toEqual(false);
		expect(get(errors).name).toEqual(false);
		expect(get(dirty).name).toEqual(false);
		expect(get(validators).name).toEqual(formValidators.name);
		expect(get(deps).name).toEqual([]);
	});

	it('[Form resetField object-like] should reset field correctly', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { resetField, values, deps, errors, dirty, touched, validators } = form;

		const valueUpdate: ValueUpdate = [{ key: 'roles', value: ['user', 'admin', 'tester'] }];

		deps.update((deps) => {
			for (const { key } of valueUpdate) {
				// TODO: user is able to update deps for fields and set them to be invalid with the rest of the form state
				setImpure(key, ['email', 'email', 'email'], deps);
			}
			return deps;
		});

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		expect(get(values).roles).toEqual(['user', 'admin', 'tester']);
		expect(get(deps).roles).toEqual(['email', 'email', 'email']);

		resetField('roles');

		expect(get(values).roles).toEqual(['user']);
		expect(get(touched).roles).toEqual([false]);
		expect(get(errors).roles).toEqual([false]);
		expect(get(dirty).roles).toEqual([false]);
		expect(get(validators).roles).toEqual([undefined]);
		expect(get(deps).roles).toEqual([[]]);
	});

	it('[Form state] should update correctly when changes occur', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { useFieldArray } = form;

		const rolesHelpers = useFieldArray('roles');
		expect(() => rolesHelpers.remove(1)).toThrowError(`Index (1) is out of bounds`);
		expect(() => rolesHelpers.remove(-1)).toThrowError(`Index (-1) is out of bounds`);
	});

	it('[Form submission] should update errors and touched state on all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		await form.submitForm(() => {})(new Event('submit'));

		expect(get(form.touched)).toEqual({ name: true, email: true, roles: [true] });
		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required', roles: [false] });
	});
});
