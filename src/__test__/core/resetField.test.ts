import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { assign } from '../../internal/util/assign';
import { FieldNotFoundError, getInternalSafe } from '../../internal/util/get';
import { setI } from '../../internal/util/set';
import { All, ResetFieldOptions, This, Values, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import {
	FormValues,
	ValueUpdate,
	initialFormValidators,
	initialFormValues,
	waitForAllFieldsToValidate,
} from './createFormUtils';

describe('resetField', () => {
	describe('Primitive', () => {
		it('should reset values & validators with no options', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate = [{ key: 'name', value: 'Test Test' }] as const satisfies ValueUpdate;
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name');

			expect(get(values)).toEqual({ ...initialValues, name: '' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: false });
			expect(get(validators).name).toEqual(initialFormValidators.name);
		});

		it('should reset values & validators with { value } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test' });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: undefined });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: false });
			expect(get(validators).name).toEqual(initialFormValidators.name);
		});

		it('should reset values & validators with { value, keepDirty } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test', keepDirty: true });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: undefined });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators).name).toEqual(initialFormValidators.name);
		});

		it('should reset values & validators with { value, keepDirty, keepError } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
				initialValidators,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test', keepDirty: true, keepError: true });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: initialFormValidators.name });
		});

		it('should reset values & validators with { value, keepDirty, keepError, validator } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
				initialValidators,
				handleBlur,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			await wait;

			const validator = () => 'test error';
			resetField('name', {
				value: 'Test',
				keepDirty: true,
				keepError: true,
				validator,
			});

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: validator });
		});

		it('should reset values & validators with { value, keepDirty, keepError, validator, keepTouched } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
				initialValidators,
				handleBlur,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			await wait;

			const validator = () => 'test error';
			resetField('name', {
				value: 'Test',
				keepDirty: true,
				keepError: true,
				validator,
				keepTouched: true,
			});

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: true });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: validator });
		});

		it('should reset values & validators with { value, keepDirty, keepError, validator, validate } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDirty,
				initialErrors,
				initialTouched,
				initialValidators,
				handleBlur,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];

			const wait = waitForAllFieldsToValidate(valueUpdate, form);
			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setI(key, () => 'error', x);
				}
				return x;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setI(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			expect(get(values)).toEqual({
				...initialValues,
				name: valueUpdate[0].value,
			});

			await wait;

			const validator = () => 'test error';
			await resetField('name', {
				value: 'Test',
				keepDirty: true,
				validator,
				keepTouched: true,
				validate: true,
			});

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: true });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'test error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: validator });
		});
	});

	describe('Array', () => {
		describe('No values & validator', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => () => 'error'),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});

				await wait;

				resetField('roles');

				expect(get(values)).toEqual(initialValues);
				expect(get(touched)).toEqual(initialTouched);
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
				expect(get(dirty)).toEqual(initialDirty);
				expect(get(validators)).toEqual(initialValidators);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => () => 'error'),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				resetField('roles', {
					keepTouched: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
				expect(get(dirty)).toEqual(initialDirty);
				expect(get(validators)).toEqual(initialValidators);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				const gotValues = get(values);
				expect(gotValues).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				const gotErrors = get(errors);
				expect(gotErrors).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', {
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			});

			it('should reset with { keepTouched, keepDirty, keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', {
					keepTouched: true,
					keepDirty: true,
					keepError: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error'] });
			});

			it('should reset with { keepTouched, keepDirty, validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				await resetField('roles', {
					keepTouched: true,
					keepDirty: true,
					validate: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true] });
				expect(get(errors)).toEqual(initialErrors);
			});
		});

		describe('With { values }', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', { value: ['test', 'user'] });

				expect(get(values)).toEqual({ ...initialValues, roles: ['test', 'user'] });
				expect(get(touched)).toEqual({ ...initialTouched, roles: [false, false] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [false, false] });
				expect(get(validators)).toEqual(initialValidators);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', {
					value: ['test', 'user'],
					keepTouched: true,
				});

				expect(get(values)).toEqual({ ...initialValues, roles: ['test', 'user'] });
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true, true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [false, false] });
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', {
					value: ['test', 'user'],
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(values)).toEqual({ ...initialValues, roles: ['test', 'user'] });
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true, true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true] });
			});

			it('should reset with { keepTouched, keepDirty, keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialValues,
					initialTouched,
					initialDirty,
					initialErrors,
				} = form;

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				resetField('roles', {
					value: ['test', 'user'],
					keepTouched: true,
					keepDirty: true,
					keepError: true,
				});

				expect(get(values)).toEqual({ ...initialValues, roles: ['test', 'user'] });
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true, true] });
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error'] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true] });
			});

			it('should reset with { keepTouched, keepDirty, validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: ['error', 'error', 'error'],
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});

				form.resetField('roles', {
					value: ['test', 'user'],
					keepTouched: true,
					keepDirty: true,
					validate: true,
				});

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: ['test', 'user'] });
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({ ...form.initialTouched, roles: [true, true] });
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true] });
			});
		});

		describe('With { validator }', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: valueUpdate[0].value.map(newValidator),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: valueUpdate[0].value.map(() => newValidator),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
					[This]: () => 'error',
					[All]: () => 'error',
					[Values]: [() => 'error'],
				};
				form.resetField('roles', {
					validator: resetValidator,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, roles: resetValidator });
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: valueUpdate[0].value.map(newValidator),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: valueUpdate[0].value.map(() => newValidator),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
					[This]: () => 'error',
					[All]: () => 'error',
					[Values]: [() => 'error'],
				};
				form.resetField('roles', {
					validator: resetValidator,
					keepTouched: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, roles: resetValidator });
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					roles: form.initialValues.roles.map(() => true),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: valueUpdate[0].value.map(newValidator),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: valueUpdate[0].value.map(() => newValidator),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
					[This]: () => 'error',
					[All]: () => 'error',
					[Values]: [() => 'error'],
				};
				form.resetField('roles', {
					validator: resetValidator,
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, roles: resetValidator });
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					roles: form.initialValues.roles.map(() => true),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					roles: form.initialValues.roles.map(() => true),
				});
			});

			it('should reset with { keepTouched, keepDirty, keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: valueUpdate[0].value.map(newValidator),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: valueUpdate[0].value.map(() => newValidator),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
					[This]: () => 'error',
					[All]: () => 'error',
					[Values]: [() => 'error'],
				};
				form.resetField('roles', {
					validator: resetValidator,
					keepTouched: true,
					keepDirty: true,
					keepError: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, roles: resetValidator });
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					roles: form.initialValues.roles.map(() => true),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: form.initialValues.roles.map(newValidator),
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					roles: form.initialValues.roles.map(() => true),
				});
			});

			it('should reset with { keepTouched, keepDirty, validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'roles', value: ['user', 'admin', 'tester'] },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, roles: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.touched)).toEqual({ ...form.initialDirty, roles: [true, true, true] });
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: valueUpdate[0].value.map(newValidator),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					roles: valueUpdate[0].value.map(() => newValidator),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
					[This]: () => 'this error',
					[All]: () => 'all error',
					[Values]: [() => 'error'],
				};
				await form.resetField('roles', {
					validator: resetValidator,
					keepTouched: true,
					keepDirty: true,
					validate: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, roles: resetValidator });
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					roles: form.initialValues.roles.map(() => true),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					roles: 'this error',
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					roles: form.initialValues.roles.map(() => true),
				});
			});
		});
	});

	describe('object', () => {
		describe('No values & validator', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				await form.resetField(valueUpdate[0].key);

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				await form.resetField(valueUpdate[0].key, {
					keepTouched: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, initialFormValues.location),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				await form.resetField(valueUpdate[0].key, {
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, initialFormValues.location),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, initialFormValues.location),
				});
			});

			it('should reset with { keepTouched, keepDirty, keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				await form.resetField(valueUpdate[0].key, {
					keepTouched: true,
					keepDirty: true,
					keepError: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, initialFormValues.location),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', initialFormValues.location),
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, initialFormValues.location),
				});
			});

			it('should reset with { keepTouched, keepDirty, validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'new error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				await form.resetField(valueUpdate[0].key, {
					keepTouched: true,
					keepDirty: true,
					validate: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, initialFormValues.location),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', initialFormValues.location),
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, initialFormValues.location),
				});
			});
		});

		describe('With { values }', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValue: ResetFieldOptions<FormValues, 'location'>['value'] = {
					address: '1 Lemon Rd',
					coords: { lat: 3, lng: 4 },
				};
				await form.resetField(valueUpdate[0].key, {
					value: resetValue,
				});

				expect(get(form.values)).toEqual({
					...form.initialValues,
					location: resetValue,
				});
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValue: ResetFieldOptions<FormValues, 'location'>['value'] = {
					address: '1 Lemon Rd',
					coords: { lat: 3, lng: 4 },
				};
				await form.resetField(valueUpdate[0].key, {
					value: resetValue,
					keepTouched: true,
				});

				expect(get(form.values)).toEqual({
					...form.initialValues,
					location: resetValue,
				});
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValue: ResetFieldOptions<FormValues, 'location'>['value'] = {
					address: '1 Lemon Rd',
					coords: { lat: 3, lng: 4 },
				};
				await form.resetField(valueUpdate[0].key, {
					value: resetValue,
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(form.values)).toEqual({
					...form.initialValues,
					location: resetValue,
				});
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
			});

			it('should reset with { keepTouched, keepDirty, keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'new error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValue: ResetFieldOptions<FormValues, 'location'>['value'] = {
					address: '1 Lemon Rd',
					coords: { lat: 3, lng: 4 },
				};
				await form.resetField(valueUpdate[0].key, {
					value: resetValue,
					keepTouched: true,
					keepDirty: true,
					keepError: true,
				});

				expect(get(form.values)).toEqual({
					...form.initialValues,
					location: resetValue,
				});
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
			});

			it('should reset with { keepTouched, keepDirty, validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'new error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValue: ResetFieldOptions<FormValues, 'location'>['value'] = {
					address: '1 Lemon Rd',
					coords: { lat: 3, lng: 4 },
				};
				await form.resetField(valueUpdate[0].key, {
					value: resetValue,
					keepTouched: true,
					keepDirty: true,
					validate: true,
				});

				expect(get(form.values)).toEqual({
					...form.initialValues,
					location: resetValue,
				});
				expect(get(form.validators)).toEqual(form.initialValidators);
				expect(get(form.touched)).toEqual({
					...form.initialTouched,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
			});
		});

		describe('with { validator }', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'location'>['validator'] = {
					[This]: () => 'error',
					...assign(() => 'error', valueUpdate[0].value),
				};
				await form.resetField(valueUpdate[0].key, {
					validator: resetValidator,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: resetValidator,
				});
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { keepError }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'new error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'location'>['validator'] = {
					[This]: () => 'error',
					...assign(() => 'error', valueUpdate[0].value),
				};
				await form.resetField(valueUpdate[0].key, {
					validator: resetValidator,
					keepError: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: resetValidator,
				});
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('new error', valueUpdate[0].value),
				});
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});

			it('should reset with { validate }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

				const valueUpdate = [
					{ key: 'location', value: { address: '456 Test St', coords: { lat: 1, lng: 2 } } },
				] as const satisfies ValueUpdate;
				const wait = waitForAllFieldsToValidate(valueUpdate, form);

				function newValidator() {
					return 'error';
				}
				form.validators.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, assign(newValidator, value), x);
					}
					return x;
				});
				form.values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, vals);
					}
					return vals;
				});
				form.handleBlur(valueUpdate[0].key);

				await wait;

				expect(get(form.values)).toEqual({ ...form.initialValues, location: valueUpdate[0].value });
				expect(get(form.dirty)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.touched)).toEqual({
					...form.initialDirty,
					location: assign(true, valueUpdate[0].value),
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: assign('error', valueUpdate[0].value),
				});
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: assign(newValidator, valueUpdate[0].value),
				});

				const resetValidator: ResetFieldOptions<FormValues, 'location'>['validator'] = {
					[This]: () => 'this error',
					...assign(() => 'error', valueUpdate[0].value),
				};
				await form.resetField(valueUpdate[0].key, {
					validator: resetValidator,
					validate: true,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.validators)).toEqual({
					...form.initialValidators,
					location: resetValidator,
				});
				expect(get(form.errors)).toEqual({
					...form.initialErrors,
					location: 'this error',
				});
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.dirty)).toEqual(form.initialDirty);
			});
		});
	});
});
