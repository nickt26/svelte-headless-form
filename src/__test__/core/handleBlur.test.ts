import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import Form from '../components/Form.svelte';
import { getComponentState } from './createFormUtils';

describe('handleBlur', () => {
	it('[Primitive] should blur field', async () => {
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
});
