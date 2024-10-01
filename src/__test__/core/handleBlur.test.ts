import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { assign } from '../../internal/util/assign';
import { setI } from '../../internal/util/set';
import Form from '../components/Form.svelte';
import { ValueUpdate, getComponentState, waitForAllFieldsToValidate } from './createFormUtils';

describe('handleBlur', () => {
	it('[InitialTouched] should not be mutated', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched } = form;

		await handleBlur('name');
		expect(initialTouched).not.toEqual(get(touched));
		await handleBlur('roles');
		expect(initialTouched).not.toEqual(get(touched));
		await handleBlur('location');
		expect(initialTouched).not.toEqual(get(touched));

		expect(initialTouched).toEqual({
			name: false,
			email: false,
			roles: [false],
			location: { address: false, coords: { lat: false, lng: false } },
		});
	});

	it('[Primitive] should blur field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched } = form;

		await handleBlur('name');

		expect(get(touched)).toEqual({ ...initialTouched, name: true });
	});

	it('[Array] should blur all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		await form.handleBlur('roles');

		expect(get(form.touched)).toEqual({
			...form.initialTouched,
			roles: assign(true, form.initialValues.roles),
		});
	});

	it('[Single Array Field] should blur field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const valueUpdate = [
			{ key: 'roles', value: ['admin', 'tester'] },
		] as const satisfies ValueUpdate;
		const wait = waitForAllFieldsToValidate(valueUpdate, form);
		form.values.update((x) => {
			for (const { key, value } of valueUpdate) {
				setI(key, value, x);
			}
			return x;
		});
		await wait;

		await form.handleBlur('roles.0');

		expect(get(form.values)).toEqual({ ...form.initialValues, roles: ['admin', 'tester'] });
		expect(get(form.touched)).toEqual({ ...form.initialTouched, roles: [true, false] });
		expect(get(form.errors)).toEqual(form.initialErrors);
		expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true] });
		expect(get(form.validators)).toEqual(form.initialValidators);
	});

	it('[Object] should blur all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched } = form;

		await handleBlur('location');
		expect(get(touched)).toEqual({
			...initialTouched,
			location: {
				//TODO: If you leave out unitNumber from the initial values object, then the test will fail and unitNumber will not be bulk updated on an object blur event
				//TODO: Look at removing this behavior and try make undefined values impossible in the form
				address: true,
				coords: { lat: true, lng: true },
			},
		});
	});

	it('[Single Object field] should blur field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched, values, useFieldArray } = form;

		await handleBlur('location.address');

		expect(get(touched)).toEqual({
			...initialTouched,
			location: { ...initialTouched.location, address: true },
		});
	});

	it("[Form handleBlur] should run validation on validateMode = 'onBlur'", async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, validateMode, validators, errors, initialTouched } = form;

		validateMode.set('onBlur');

		validators.update((vals) => ({ ...vals, roles: [() => 'error'] }));

		await handleBlur('roles.0');

		expect(get(touched)).toEqual({
			...initialTouched,
			roles: [true],
		});
		expect(get(errors)).toEqual({
			roles: ['error'],
		});
	});

	it('[Incorrect path] should do nothing', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched } = form;

		// @ts-expect-error
		await handleBlur('fake');

		expect(get(touched)).toEqual(initialTouched);
	});
});
