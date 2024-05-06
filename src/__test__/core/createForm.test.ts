import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { setImpure } from '../../internal/util/set';
import { DotPaths, PartialValidatorFields, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';

export const formValues = {
	name: '',
	email: '',
};
type FormValues = typeof formValues;

export const formValidators: PartialValidatorFields<FormValues> = {
	name: (value) => value.length === 0 && 'Required',
	email: (value) => value.length === 0 && 'Required',
};

function getComponentState(component: Form) {
	return component.$capture_state() as unknown as { form: FormType<FormValues> };
}

function waitForAllFieldsToValidate(
	valueUpdates: Array<{ key: DotPaths<FormValues>; value: any }>,
	form: FormType<FormValues>,
): Promise<void> {
	const { latestFieldEvent } = form;
	return new Promise<void>((resolve) => {
		const fieldsThatHaveValidated: string[] = [];
		const unsub = latestFieldEvent.subscribe(async (x) => {
			if (x?.event === 'afterValidate') {
				fieldsThatHaveValidated.push(x.field[0][0]);
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
		expect(get(form.touched)).toEqual({ name: false, email: false });
		expect(get(form.errors)).toEqual({ name: false, email: false });
		expect(get(form.dirty)).toEqual({ name: false, email: false });
		expect(get(form.deps)).toEqual({ name: [], email: [] });
		expect(get(form.validators)).toEqual(formValidators);
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
		];

		const wait = waitForAllFieldsToValidate(valueUpdates, form);

		form.values.update((values) => {
			for (const { key, value } of valueUpdates) {
				setImpure(key, value, values);
			}
			return values;
		});

		await wait;

		expect(get(form.errors)).toEqual({ name: false, email: false });
		expect(get(form.dirty)).toEqual({ name: true, email: true });
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

		expect(get(form.errors)).toEqual({ name: 'Required', email: false });
		expect(get(form.dirty)).toEqual({ name: true, email: true });
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

		expect(get(form.errors)).toEqual({ name: false, email: 'Required' });
		expect(get(form.dirty)).toEqual({ name: true, email: true });
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

		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required' });
		expect(get(form.dirty)).toEqual({ name: true, email: true });
	});

	it('[Form touched-change] should blur name field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		handleBlur('name');

		expect(get(touched)).toEqual({ name: true, email: false });
	});

	it('[Form touched-change] should blur email field', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		handleBlur('email');

		expect(get(touched)).toEqual({ name: false, email: true });
	});

	it('[Form touched-change] touched values should be true for all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		const { touched, handleBlur } = form;

		handleBlur('name');
		handleBlur('email');

		expect(get(touched)).toEqual({ name: true, email: true });
	});

	it('[Form submission] should update errors and touched state on all fields', async () => {
		const { component } = render(Form);
		const { form } = getComponentState(component);

		await form.submitForm(() => {})(new Event('submit'));

		expect(get(form.touched)).toEqual({ name: true, email: true });
		expect(get(form.errors)).toEqual({ name: 'Required', email: 'Required' });
	});
});
