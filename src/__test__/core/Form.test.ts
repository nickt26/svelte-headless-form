import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';

export const formValues = {
	name: '',
	email: '',
};

type FormValues = typeof formValues;

const getComponentState = (component: Form) =>
	component.$capture_state() as unknown as { form: FormType<FormValues> };

describe('Form', () => {
	it('should not have any errors present', async () => {
		const { component } = render(Form);

		const { form } = getComponentState(component);

		form.values.update((values) => ({ ...values, name: 'Test Test' }));
		form.values.update((values) => ({ ...values, email: 'test@test.com' }));

		expect(get(form.errors)).toEqual({ name: false, email: false });

		// const user = userEvent.setup();

		// const nameInput = screen.getByTestId('name-input');
		// const emailInput = screen.getByTestId('email-input');
		// const submitButton = screen.getByTestId('submit-button');

		// await user.type(nameInput, 'Test Test');
		// await user.type(emailInput, 'test@test.com');
		// await user.click(submitButton);

		// const nameError = screen.queryByTestId('name-error');
		// const emailError = screen.queryByTestId('email-error');

		// expect(nameError).not.toBeInTheDocument();
		// expect(emailError).not.toBeInTheDocument();
	});

	it('should have error for name-input', async () => {
		const user = userEvent.setup();

		const emailInput = screen.getByTestId('email-input');
		const submitButton = screen.getByTestId('submit-button');

		await user.type(emailInput, 'test@test.com');
		await user.click(submitButton);

		const nameError = screen.queryByTestId('name-error');
		const emailError = screen.queryByTestId('email-error');

		expect(nameError).toBeInTheDocument();
		expect(emailError).not.toBeInTheDocument();
	});

	it('should have error for email-input', async () => {
		const user = userEvent.setup();

		const nameInput = screen.getByTestId('name-input');
		const submitButton = screen.getByTestId('submit-button');

		await user.type(nameInput, 'Test Test');
		await user.click(submitButton);

		const nameError = screen.queryByTestId('name-error');
		const emailError = screen.queryByTestId('email-error');

		expect(nameError).not.toBeInTheDocument();
		expect(emailError).toBeInTheDocument();
	});

	it('should have errors for name-input & email-input', async () => {
		const user = userEvent.setup();

		const submitButton = screen.getByTestId('submit-button');

		await user.click(submitButton);

		const nameError = screen.queryByTestId('name-error');
		const emailError = screen.queryByTestId('email-error');

		expect(nameError).toBeInTheDocument();
		expect(emailError).toBeInTheDocument();
	});

	it('touched values to be correct for all inputs', async () => {
		const user = userEvent.setup();

		const body = document.querySelector('body')!;

		const formInputs = document.querySelectorAll('input');
		for (const input of formInputs) {
			const touchedElem = screen.getByTestId(`${input.name}-touched`);
			expect(touchedElem).toHaveTextContent('false');
			await user.click(input);
			await user.click(body);
			expect(touchedElem).toHaveTextContent('true');
		}
	});
});

describe('createForm', () => {
	it('should create a form', async () => {
		const page = render(Form);
		const user = userEvent.setup();

		type FormValues = {
			name: string;
			email: string;
		};

		const pageState = page.component.$capture_state() as unknown as { form: FormType<FormValues> };
		const form = pageState.form;

		const nameInput = screen.getByTestId('name-input');

		await user.type(nameInput, 'Test Test');

		form.values.update((values) => ({ ...values, name: 'Banana' }));

		expect(form).toBeDefined();
		expect(get(form.values)).toEqual({ name: 'Banana', email: '' });
	});
});
