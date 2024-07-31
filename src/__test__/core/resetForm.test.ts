import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { assign } from '../../internal/util/assign';
import { setImpure } from '../../internal/util/set';
import { PartialDeep, PartialValidatorFields, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import { FormValues, ValueUpdate, waitForAllFieldsToValidate } from './createFormUtils';

const valueUpdate = [
	{ key: 'roles', value: ['user', 'admin', 'tester'] },
	{ key: 'name', value: 'Jack Sparrow' },
	{ key: 'location.address', value: '4 Cunningham Road' },
] as const satisfies ValueUpdate;

describe('resetForm', () => {
	it('should reset form with no options', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(
					key,
					assign(() => 'error', value),
					x,
				);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		resetForm();

		expect(get(values)).toEqual(initialValues);
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);
		expect(get(validators)).toEqual(initialValidators);
	});

	it('should reset form with { values }', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(
					key,
					assign(() => 'error', value),
					x,
				);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		const newValues: PartialDeep<FormValues> = {
			name: 'John Doe',
		};
		resetForm({
			values: newValues,
		});

		expect(get(values)).toEqual({ ...initialValues, name: 'John Doe' });
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);
		expect(get(validators)).toEqual(initialValidators);
	});

	it('should reset form with { values, validators }', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(
					key,
					assign(() => 'error', value),
					x,
				);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		const newValidators: PartialValidatorFields<FormValues> = {
			name: (value) => !value.length && 'Required',
		};
		resetForm({
			values: {
				name: 'John Doe',
			},
			validators: newValidators,
		});

		expect(get(values)).toEqual({ ...initialValues, name: 'John Doe' });
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);
		expect(get(validators).name).toEqual(newValidators.name);
	});

	it('should reset form with { values, validators }', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(
					key,
					assign(() => 'error', value),
					x,
				);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		const newValidators: PartialValidatorFields<FormValues> = {
			name: (value) => !value.length && 'Required',
		};
		resetForm({
			values: {
				name: 'John Doe',
			},
			validators: newValidators,
		});

		expect(get(values)).toEqual({ ...initialValues, name: 'John Doe' });
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);
		expect(get(validators).name).toEqual(newValidators.name);
	});

	it('should reset form with { values, validators, keepValidators }', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		function validator() {
			return 'error';
		}
		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(key, assign(validator, value), x);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		const newValidators: PartialValidatorFields<FormValues> = {
			name: (value) => !value.length && 'Required',
		};
		resetForm({
			values: {
				name: 'John Doe',
			},
			validators: newValidators,
			keepValidators: true,
		});

		expect(get(values)).toEqual({ ...initialValues, name: 'John Doe' });
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);

		const validatorsInstance = get(validators);
		expect(validatorsInstance).not.toEqual(initialValidators);
		expect(validatorsInstance.name).toEqual(newValidators.name);
		expect(validatorsInstance.roles[0]).toEqual(validator);
		expect(validatorsInstance.location.address).toEqual(validator);
	});

	it('should reset form with { values,validators, keepValidators, keepTouched }', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
			handleBlur,
		} = form;

		const wait = waitForAllFieldsToValidate(valueUpdate, form);

		function validator() {
			return 'error';
		}
		validators.update((x) => {
			for (const { key, value } of valueUpdate) {
				setImpure(key, assign(validator, value), x);
			}
			return x;
		});
		values.update((vals) => {
			for (const { key, value } of valueUpdate) {
				handleBlur(key);
				setImpure(key, value, vals);
			}
			return vals;
		});

		await wait;

		const newValidators: PartialValidatorFields<FormValues> = {
			name: (value) => !value.length && 'Required',
		};
		resetForm({
			values: {
				name: 'John Doe',
			},
			validators: newValidators,
			keepValidators: true,
			keepTouched: true,
		});

		expect(get(values)).toEqual({ ...initialValues, name: 'John Doe' });
		const touchedInstance = get(touched);
		expect(touchedInstance).not.toEqual(initialTouched);
		expect(touchedInstance).toEqual({
			...initialTouched,
			name: true,
			roles: [true],
			location: { ...initialTouched.location, address: true },
		});
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);

		const validatorsInstance = get(validators);
		expect(validatorsInstance).not.toEqual(initialValidators);
		expect(validatorsInstance.name).toEqual(newValidators.name);
		expect(validatorsInstance.roles[0]).toEqual(validator);
		expect(validatorsInstance.location.address).toEqual(validator);
	});
});
