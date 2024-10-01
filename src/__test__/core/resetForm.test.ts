import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { assign, assignUsing } from '../../internal/util/assign';
import { clone } from '../../internal/util/clone';
import { getInternal } from '../../internal/util/get';
import { mergeRightI } from '../../internal/util/mergeRightDeep';
import { setI } from '../../internal/util/set';
import { ResetFormOptions, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import { FormValues, ValueUpdate, waitForAllFieldsToValidate } from './createFormUtils';

const valueUpdate = [
	{ key: 'roles', value: ['user', 'admin', 'tester'] },
	{ key: 'name', value: 'Jack Sparrow' },
	{ key: 'location.address', value: '4 Cunningham Road' },
	{ key: 'location.coords.lat', value: 3 },
] as const satisfies ValueUpdate;

describe('resetForm', () => {
	describe('With no values & validators', () => {
		it('should reset form', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
			for (const { key } of valueUpdate) {
				await form.handleBlur(key);
			}

			await wait;

			const valsAfterUpdate = clone(form.initialValues);
			for (const { key, value } of valueUpdate) {
				setI(key, value, valsAfterUpdate);
			}
			const touchedAfterUpdate = clone(form.initialTouched);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), touchedAfterUpdate);
			}
			const errAfterUpdate = clone(form.initialErrors);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator(), value), errAfterUpdate);
			}
			const dirtyAfterUpdate = clone(form.initialDirty);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), dirtyAfterUpdate);
			}
			const validatorsAfterUpdate = clone(form.initialValidators);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator, value), validatorsAfterUpdate);
			}
			expect(get(form.values)).toEqual(valsAfterUpdate);
			expect(get(form.touched)).toEqual(touchedAfterUpdate);
			expect(get(form.errors)).toEqual(errAfterUpdate);
			expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
			expect(get(form.validators)).toEqual(validatorsAfterUpdate);

			form.resetForm();

			expect(get(form.values)).toEqual(form.initialValues);
			expect(get(form.touched)).toEqual(form.initialTouched);
			expect(get(form.errors)).toEqual(form.initialErrors);
			expect(get(form.dirty)).toEqual(form.initialDirty);
			expect(get(form.validators)).toEqual(form.initialValidators);
		});

		it('should reset form with { keepTouched }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
			for (const { key } of valueUpdate) {
				await form.handleBlur(key);
			}

			await wait;

			const valsAfterUpdate = clone(form.initialValues);
			for (const { key, value } of valueUpdate) {
				setI(key, value, valsAfterUpdate);
			}
			const touchedAfterUpdate = clone(form.initialTouched);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), touchedAfterUpdate);
			}
			const errAfterUpdate = clone(form.initialErrors);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator(), value), errAfterUpdate);
			}
			const dirtyAfterUpdate = clone(form.initialDirty);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), dirtyAfterUpdate);
			}
			const validatorsAfterUpdate = clone(form.initialValidators);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator, value), validatorsAfterUpdate);
			}
			expect(get(form.values)).toEqual(valsAfterUpdate);
			expect(get(form.touched)).toEqual(touchedAfterUpdate);
			expect(get(form.errors)).toEqual(errAfterUpdate);
			expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
			expect(get(form.validators)).toEqual(validatorsAfterUpdate);

			form.resetForm({
				keepTouched: true,
			});

			const formTouched = get(form.touched);
			const touchedAfterReset = clone(form.initialTouched);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formTouched)), touchedAfterReset);
			}
			expect(get(form.values)).toEqual(form.initialValues);
			expect(formTouched).toEqual(touchedAfterReset);
			expect(get(form.errors)).toEqual(form.initialErrors);
			expect(get(form.dirty)).toEqual(form.initialDirty);
			expect(get(form.validators)).toEqual(form.initialValidators);
		});

		it('should reset form with { keepTouched, keepDirty }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
			for (const { key } of valueUpdate) {
				await form.handleBlur(key);
			}

			await wait;

			const valsAfterUpdate = clone(form.initialValues);
			for (const { key, value } of valueUpdate) {
				setI(key, value, valsAfterUpdate);
			}
			const touchedAfterUpdate = clone(form.initialTouched);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), touchedAfterUpdate);
			}
			const errAfterUpdate = clone(form.initialErrors);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator(), value), errAfterUpdate);
			}
			const dirtyAfterUpdate = clone(form.initialDirty);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), dirtyAfterUpdate);
			}
			const validatorsAfterUpdate = clone(form.initialValidators);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator, value), validatorsAfterUpdate);
			}
			expect(get(form.values)).toEqual(valsAfterUpdate);
			expect(get(form.touched)).toEqual(touchedAfterUpdate);
			expect(get(form.errors)).toEqual(errAfterUpdate);
			expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
			expect(get(form.validators)).toEqual(validatorsAfterUpdate);

			form.resetForm({
				keepTouched: true,
				keepDirty: true,
			});

			const formTouched = get(form.touched);
			const touchedAfterReset = clone(form.initialTouched);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formTouched)), touchedAfterReset);
			}
			const formDirty = get(form.dirty);
			const dirtyAfterReset = clone(form.initialDirty);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formDirty)), dirtyAfterReset);
			}
			expect(get(form.values)).toEqual(form.initialValues);
			expect(formTouched).toEqual(touchedAfterReset);
			expect(get(form.errors)).toEqual(form.initialErrors);
			expect(formDirty).toEqual(dirtyAfterReset);
			expect(get(form.validators)).toEqual(form.initialValidators);
		});

		it('should reset form with { keepTouched, keepDirty, keepErrors }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
			for (const { key } of valueUpdate) {
				await form.handleBlur(key);
			}

			await wait;

			const valsAfterUpdate = clone(form.initialValues);
			for (const { key, value } of valueUpdate) {
				setI(key, value, valsAfterUpdate);
			}
			const touchedAfterUpdate = clone(form.initialTouched);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), touchedAfterUpdate);
			}
			const errAfterUpdate = clone(form.initialErrors);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator(), value), errAfterUpdate);
			}
			const dirtyAfterUpdate = clone(form.initialDirty);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), dirtyAfterUpdate);
			}
			const validatorsAfterUpdate = clone(form.initialValidators);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator, value), validatorsAfterUpdate);
			}
			expect(get(form.values)).toEqual(valsAfterUpdate);
			expect(get(form.touched)).toEqual(touchedAfterUpdate);
			expect(get(form.errors)).toEqual(errAfterUpdate);
			expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
			expect(get(form.validators)).toEqual(validatorsAfterUpdate);

			form.resetForm({
				keepTouched: true,
				keepDirty: true,
				keepErrors: true,
			});

			const formTouched = get(form.touched);
			const touchedAfterReset = clone(form.initialTouched);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formTouched)), touchedAfterReset);
			}
			const formDirty = get(form.dirty);
			const dirtyAfterReset = clone(form.initialDirty);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formDirty)), dirtyAfterReset);
			}
			const formErrors = get(form.errors);
			const errsAfterReset = clone(form.initialErrors);
			for (const { key } of valueUpdate) {
				setI(key, assign(newValidator(), getInternal(key, formErrors)), errsAfterReset);
			}
			expect(get(form.values)).toEqual(form.initialValues);
			expect(formTouched).toEqual(touchedAfterReset);
			expect(formErrors).toEqual(errsAfterReset);
			expect(formDirty).toEqual(dirtyAfterReset);
			expect(get(form.validators)).toEqual(form.initialValidators);
		});

		it('should reset form with { keepTouched, keepDirty, keepErrors, keepValidators }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
			for (const { key } of valueUpdate) {
				await form.handleBlur(key);
			}

			await wait;

			const valsAfterUpdate = clone(form.initialValues);
			for (const { key, value } of valueUpdate) {
				setI(key, value, valsAfterUpdate);
			}
			const touchedAfterUpdate = clone(form.initialTouched);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), touchedAfterUpdate);
			}
			const errAfterUpdate = clone(form.initialErrors);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator(), value), errAfterUpdate);
			}
			const dirtyAfterUpdate = clone(form.initialDirty);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(true, value), dirtyAfterUpdate);
			}
			const validatorsAfterUpdate = clone(form.initialValidators);
			for (const { key, value } of valueUpdate) {
				setI(key, assign(newValidator, value), validatorsAfterUpdate);
			}
			expect(get(form.values)).toEqual(valsAfterUpdate);
			expect(get(form.touched)).toEqual(touchedAfterUpdate);
			expect(get(form.errors)).toEqual(errAfterUpdate);
			expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
			expect(get(form.validators)).toEqual(validatorsAfterUpdate);

			form.resetForm({
				keepTouched: true,
				keepDirty: true,
				keepErrors: true,
				keepValidators: true,
			});

			const formTouched = get(form.touched);
			const touchedAfterReset = clone(form.initialTouched);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formTouched)), touchedAfterReset);
			}
			const formDirty = get(form.dirty);
			const dirtyAfterReset = clone(form.initialDirty);
			for (const { key } of valueUpdate) {
				setI(key, assign(true, getInternal(key, formDirty)), dirtyAfterReset);
			}
			const formErrors = get(form.errors);
			const errsAfterReset = clone(form.initialErrors);
			for (const { key } of valueUpdate) {
				setI(key, assign(newValidator(), getInternal(key, formErrors)), errsAfterReset);
			}
			const formValidators = get(form.validators);
			const validatorsAfterReset = clone(form.initialValidators);
			for (const { key } of valueUpdate) {
				setI(key, assign(newValidator, getInternal(key, formValidators)), validatorsAfterReset);
			}
			expect(get(form.values)).toEqual(form.initialValues);
			expect(formTouched).toEqual(touchedAfterReset);
			expect(formErrors).toEqual(errsAfterReset);
			expect(formDirty).toEqual(dirtyAfterReset);
			expect(formValidators).toEqual(validatorsAfterReset);
		});
	});

	describe('primitive', () => {
		describe('with { values }', () => {
			it('should reset form', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					name: 'John Doe',
				};
				form.resetForm({
					values: newValues,
				});

				expect(get(form.values)).toEqual({ ...form.initialValues, name: 'John Doe' });
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset form with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					name: 'John Doe',
				};
				form.resetForm({
					values: newValues,
					keepTouched: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				expect(formValues).toEqual({ ...form.initialValues, name: 'John Doe' });
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset form with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});
				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					name: 'John Doe',
				};
				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				expect(formValues).toEqual({ ...form.initialValues, name: 'John Doe' });
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset form with { keepTouched, keepDirty, keepErrors }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});
				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					name: 'John Doe',
				};
				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
					keepErrors: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				const errsAfterReset = clone(form.initialErrors);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator(), getInternal(key, formValues)), errsAfterReset);
				}
				expect(formValues).toEqual({ ...form.initialValues, name: 'John Doe' });
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(errsAfterReset);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset form with { keepTouched, keepDirty, keepErrors, keepValidators }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});
				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					name: 'John Doe',
				};
				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
					keepErrors: true,
					keepValidators: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				const errsAfterReset = clone(form.initialErrors);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator(), getInternal(key, formValues)), errsAfterReset);
				}
				const validatorsAfterReset = clone(form.initialValidators);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator, getInternal(key, formValues)), validatorsAfterReset);
				}
				expect(formValues).toEqual({ ...form.initialValues, name: 'John Doe' });
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(errsAfterReset);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(validatorsAfterReset);
			});
		});

		describe('with { validators }', () => {
			it('should reset form', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});
				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValidators: ResetFormOptions<FormValues>['validators'] = {
					name: (val) => !val.length && 'error',
				};
				form.resetForm({
					validators: newValidators,
				});

				expect(get(form.values)).toEqual(form.initialValues);
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				expect(get(form.validators)).toEqual({ ...form.initialValidators, ...newValidators });
			});

			it('should reset form with { keepValidat, undefined>ors }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});
				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValidators: ResetFormOptions<FormValues>['validators'] = {
					name: (val) => !val.length && 'error',
				};
				form.resetForm({
					validators: newValidators,
					keepValidators: true,
				});

				const formValues = get(form.values);
				expect(formValues).toEqual(form.initialValues);
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				const formValidators = get(form.validators);
				expect(formValidators).toEqual(
					mergeRightI(assignUsing(formValues, validatorsAfterUpdate), newValidators),
				);
			});
		});
	});

	describe('object', () => {
		describe('with { values }', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: ResetFormOptions<FormValues>['values'] = {
					location: {
						address: '123 test st',
						coords: {
							lat: 3,
							lng: 10,
						},
					},
				};
				form.resetForm({
					values: newValues,
				});

				expect(get(form.values)).toEqual(mergeRightI(form.initialValues, newValues));
				expect(get(form.touched)).toEqual(form.initialTouched);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: NonNullable<Parameters<typeof form.resetForm>[0]>['values'] = {
					location: {
						address: '123 test st',
						coords: {
							lat: 3,
							lng: 10,
						},
					},
				};

				form.resetForm({
					values: newValues,
					keepTouched: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				expect(formValues).toEqual(mergeRightI(form.initialValues, newValues));
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(form.initialDirty);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: NonNullable<Parameters<typeof form.resetForm>[0]>['values'] = {
					location: {
						address: '123 test st',
						coords: {
							lat: 3,
							lng: 10,
						},
					},
				};

				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				expect(formValues).toEqual(mergeRightI(form.initialValues, newValues));
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(form.initialErrors);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset with { keepTouched, keepDirty, keepErrors }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: NonNullable<Parameters<typeof form.resetForm>[0]>['values'] = {
					location: {
						address: '123 test st',
						coords: {
							lat: 3,
							lng: 10,
						},
					},
				};

				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
					keepErrors: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				const errsAfterReset = clone(form.initialErrors);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator(), getInternal(key, formValues)), errsAfterReset);
				}
				expect(formValues).toEqual(mergeRightI(form.initialValues, newValues));
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(errsAfterReset);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(form.initialValidators);
			});

			it('should reset with { keepTouched, keepDirty, keepErrors, keepValidators }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };

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
				form.values.update((x) => {
					for (const { key, value } of valueUpdate) {
						setI(key, value, x);
					}
					return x;
				});

				for (const { key } of valueUpdate) {
					await form.handleBlur(key);
				}

				await wait;

				const valsAfterUpdate = clone(form.initialValues);
				for (const { key, value } of valueUpdate) {
					setI(key, value, valsAfterUpdate);
				}
				const touchedAfterUpdate = clone(form.initialTouched);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), touchedAfterUpdate);
				}
				const errAfterUpdate = clone(form.initialErrors);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator(), value), errAfterUpdate);
				}
				const dirtyAfterUpdate = clone(form.initialDirty);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(true, value), dirtyAfterUpdate);
				}
				const validatorsAfterUpdate = clone(form.initialValidators);
				for (const { key, value } of valueUpdate) {
					setI(key, assign(newValidator, value), validatorsAfterUpdate);
				}
				expect(get(form.values)).toEqual(valsAfterUpdate);
				expect(get(form.touched)).toEqual(touchedAfterUpdate);
				expect(get(form.errors)).toEqual(errAfterUpdate);
				expect(get(form.dirty)).toEqual(dirtyAfterUpdate);
				expect(get(form.validators)).toEqual(validatorsAfterUpdate);

				const newValues: NonNullable<Parameters<typeof form.resetForm>[0]>['values'] = {
					location: {
						address: '123 test st',
						coords: {
							lat: 3,
							lng: 10,
						},
					},
				};

				form.resetForm({
					values: newValues,
					keepTouched: true,
					keepDirty: true,
					keepErrors: true,
					keepValidators: true,
				});

				const formValues = get(form.values);
				const touchedAfterReset = clone(form.initialTouched);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), touchedAfterReset);
				}
				const dirtyAfterReset = clone(form.initialDirty);
				for (const { key } of valueUpdate) {
					setI(key, assign(true, getInternal(key, formValues)), dirtyAfterReset);
				}
				const errsAfterReset = clone(form.initialErrors);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator(), getInternal(key, formValues)), errsAfterReset);
				}
				const validatorsAfterReset = clone(form.initialValidators);
				for (const { key } of valueUpdate) {
					setI(key, assign(newValidator, getInternal(key, formValues)), validatorsAfterReset);
				}
				expect(formValues).toEqual(mergeRightI(form.initialValues, newValues));
				expect(get(form.touched)).toEqual(touchedAfterReset);
				expect(get(form.errors)).toEqual(errsAfterReset);
				expect(get(form.dirty)).toEqual(dirtyAfterReset);
				expect(get(form.validators)).toEqual(validatorsAfterReset);
			});
		});
	});
});
