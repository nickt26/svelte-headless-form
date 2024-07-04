import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
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
		const { touched, handleBlur, initialTouched } = form;

		await handleBlur('roles');

		expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
	});

	it('[Single Array Field] should blur field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur, initialTouched, values, useFieldArray } = form;

		const valueUpdate = [
			{ key: 'roles', value: ['admin', 'tester'] },
		] as const satisfies ValueUpdate;
		const arrayField = useFieldArray('roles');
		const wait = waitForAllFieldsToValidate(valueUpdate, form);
		// TODO: This test throws error in getTriggers()
		values.update((vals) => {
			for (const value of valueUpdate[0].value) {
				arrayField.append(value);
			}
			vals.roles = valueUpdate[0].value;
			return vals;
		});
		await wait;

		await handleBlur('roles.0');

		expect(get(touched)).toEqual({ ...initialTouched, roles: [true, false, false] });
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
		const { touched, handleBlur, validateMode, validators, errors } = form;

		validateMode.set('onBlur');

		validators.update((vals) => ({ ...vals, roles: [() => 'error'] }));

		await handleBlur('roles.0');

		expect(get(touched)).toEqual({
			name: false,
			email: false,
			roles: [true],
			location: { address: false, coords: { lat: false, lng: false } },
		});
		expect(get(errors)).toEqual({
			name: false,
			email: false,
			roles: ['error'],
			location: { address: false, coords: { lat: false, lng: false } },
		});
	});

	it('[Incorrect path] should do nothing', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);
		const { touched, handleBlur } = form;

		// @ts-expect-error
		await handleBlur('fake');

		expect(get(touched)).toEqual({
			name: false,
			email: false,
			roles: [false],
			location: { address: false, coords: { lat: false, lng: false } },
		});
	});
});
