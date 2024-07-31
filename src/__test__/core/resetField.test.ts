import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { FieldNotFoundError, getInternalSafe } from '../../internal/util/get';
import { setImpure } from '../../internal/util/set';
import { All, ResetFieldOptions, This, Values, type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import {
	FormValues,
	ValueUpdate,
	formValidators,
	waitForAllFieldsToValidate,
} from './createFormUtils';

describe('resetField', () => {
	describe('Primitive', () => {
		it('should reset values, deps & validators with no options', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name');

			expect(get(values)).toEqual({ ...initialValues, name: '' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: false });
			expect(get(validators).name).toEqual(formValidators.name);
			expect(get(deps)).toEqual(initialDeps);
		});

		it('should reset values, deps & validators with { value } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
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
			expect(get(validators).name).toEqual(formValidators.name);
			expect(get(deps)).toEqual(initialDeps);
		});

		it('should reset values, deps & validators with { value, deps } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test', deps: ['email'] });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: undefined });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: false });
			expect(get(validators).name).toEqual(formValidators.name);
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});

		it('should reset values, deps & validators with { value, deps, keepDirty } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
				initialDirty,
				initialErrors,
				initialTouched,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test', deps: ['email'], keepDirty: true });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: undefined });
			expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators).name).toEqual(formValidators.name);
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});

		it('should reset values, deps & validators with { value, deps, keepDirty, keepError } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
				initialDirty,
				initialErrors,
				initialTouched,
				initialValidators,
			} = form;

			const valueUpdate: ValueUpdate = [{ key: 'name', value: 'Test Test' }];
			const wait = waitForAllFieldsToValidate(valueUpdate, form);

			validators.update((x) => {
				for (const { key } of valueUpdate) {
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('name', { value: 'Test', deps: ['email'], keepDirty: true, keepError: true });

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: formValidators.name });
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});

		it('should reset values, deps & validators with { value, deps, keepDirty, keepError, validator } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
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
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			await wait;

			const validator = () => 'test error';
			resetField('name', {
				value: 'Test',
				deps: ['email'],
				keepDirty: true,
				keepError: true,
				validator,
			});

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: false });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: validator });
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});

		it('should reset values, deps & validators with { value, deps, keepDirty, keepError, validator, keepTouched } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
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
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			await wait;

			const validator = () => 'test error';
			resetField('name', {
				value: 'Test',
				deps: ['email'],
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
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});

		it('should reset values, deps & validators with { value, deps, keepDirty, keepError, validator, validate } option', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValues,
				initialDeps,
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
					setImpure(key, () => 'error', x);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});
			handleBlur('name');

			await wait;

			const waitForResetFieldValidate = waitForAllFieldsToValidate(['name'], form);
			const validator = () => 'test error';
			resetField('name', {
				value: 'Test',
				deps: ['email'],
				keepDirty: true,
				validator,
				keepTouched: true,
				validate: true,
			});
			await waitForResetFieldValidate;

			expect(get(values)).toEqual({ ...initialValues, name: 'Test' });
			expect(get(touched)).toEqual({ ...initialTouched, name: true });
			expect(get(errors)).toEqual({ ...initialErrors, name: 'test error' });
			expect(get(dirty)).toEqual({ ...initialDirty, name: true });
			expect(get(validators)).toEqual({ ...initialValidators, name: validator });
			expect(get(deps)).toEqual({ ...initialDeps, name: ['email'] });
		});
	});

	describe('Array', () => {
		describe('No values, deps & validator', () => {
			it('should reset', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					deps,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialDeps,
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
						setImpure(
							key,
							value.map(() => () => 'error'),
							x,
						);
					}
					return x;
				});
				deps.update((deps) => {
					for (const { key } of valueUpdate) {
						// TODO: user is able to update deps for fields and set them to be invalid with the rest of the form state
						setImpure(key, ['email', 'email', 'email'], deps);
					}
					return deps;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setImpure(key, value, vals);
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
				expect(get(deps)).toEqual(initialDeps);
			});

			it('should reset with { keepTouched }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					deps,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialDeps,
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
						setImpure(
							key,
							value.map(() => () => 'error'),
							x,
						);
					}
					return x;
				});
				deps.update((deps) => {
					for (const { key } of valueUpdate) {
						setImpure(key, ['email', 'email', 'email'], deps);
					}
					return deps;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setImpure(key, value, vals);
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
				expect(get(deps)).toEqual(initialDeps);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					deps,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialDeps,
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
						setImpure(key, value.map(newValidator), x);
					}
					return x;
				});
				deps.update((deps) => {
					for (const { key } of valueUpdate) {
						setImpure(key, ['email', 'email', 'email'], deps);
					}
					return deps;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setImpure(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				// TODO: FIX
				expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});
				expect(get(deps)).toEqual({ ...initialDeps, roles: ['email', 'email', 'email'] });

				resetField('roles', {
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(deps)).toEqual(initialDeps);
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			});

			it('should reset with { keepTouched, keepDirty }', async () => {
				const { component } = render(Form);
				const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
				const {
					resetField,
					values,
					deps,
					errors,
					dirty,
					touched,
					validators,
					initialValidators,
					initialDeps,
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
						setImpure(
							key,
							value.map(() => newValidator),
							x,
						);
					}
					return x;
				});
				deps.update((deps) => {
					for (const { key } of valueUpdate) {
						setImpure(key, ['email', 'email', 'email'], deps);
					}
					return deps;
				});
				values.update((vals) => {
					for (const { key, value } of valueUpdate) {
						setImpure(key, value, vals);
					}
					return vals;
				});
				form.handleBlur('roles');

				await wait;

				expect(get(values)).toEqual({ ...initialValues, roles: valueUpdate[0].value });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true, true, true] });
				expect(get(touched)).toEqual({ ...initialDirty, roles: [true, true, true] });
				// TODO: Fix
				// expect(get(errors)).toEqual({ ...initialErrors, roles: ['error', 'error', 'error'] });
				expect(get(validators)).toEqual({
					...initialValidators,
					roles: [newValidator, newValidator, newValidator],
				});
				expect(get(deps)).toEqual({ ...initialDeps, roles: ['email', 'email', 'email'] });

				resetField('roles', {
					keepTouched: true,
					keepDirty: true,
				});

				expect(get(values)).toEqual(initialValues);
				expect(get(deps)).toEqual(initialDeps);
				expect(get(validators)).toEqual(initialValidators);
				expect(get(touched)).toEqual({ ...initialTouched, roles: [true] });
				expect(get(dirty)).toEqual({ ...initialDirty, roles: [true] });
				expect(get(errors)).toEqual(initialErrors);
				expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			});
		});

		it('should reset with { value }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValidators,
				initialDeps,
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
					setImpure(
						key,
						value.map(() => () => 'error'),
						x,
					);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email', 'email', 'email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('roles', { value: ['test'] });

			expect(get(values)).toEqual({ ...initialValues, roles: ['test'] });
			expect(get(touched)).toEqual(initialTouched);
			expect(get(errors)).toEqual(initialErrors);
			expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual(initialDirty);
			expect(get(validators)).toEqual(initialValidators);
			expect(get(deps)).toEqual(initialDeps);
		});

		it('should reset with { value, deps }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValidators,
				initialDeps,
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
					setImpure(
						key,
						value.map(() => () => 'error'),
						x,
					);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email', 'email', 'email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			resetField('roles', { value: ['test'], deps: [['email', 'name']] });

			expect(get(values)).toEqual({ ...initialValues, roles: ['test'] });
			expect(get(deps)).toEqual({ ...initialDeps, roles: [['email', 'name']] });
			expect(get(touched)).toEqual(initialTouched);
			expect(get(errors)).toEqual(initialErrors);
			expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual(initialDirty);
			expect(get(validators)).toEqual(initialValidators);
		});

		it('should reset with { value, deps, validator }', async () => {
			const { component } = render(Form);
			const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
			const {
				resetField,
				values,
				deps,
				errors,
				dirty,
				touched,
				validators,
				initialValidators,
				initialDeps,
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
					setImpure(
						key,
						value.map(() => () => 'error'),
						x,
					);
				}
				return x;
			});
			deps.update((deps) => {
				for (const { key } of valueUpdate) {
					setImpure(key, ['email', 'email', 'email'], deps);
				}
				return deps;
			});
			values.update((vals) => {
				for (const { key, value } of valueUpdate) {
					setImpure(key, value, vals);
				}
				return vals;
			});

			await wait;

			const newValidator: ResetFieldOptions<FormValues, 'roles'>['validator'] = {
				[This]: (val) => 'error',
				[All]: (val) => 'error',
				[Values]: [(val) => 'error'],
			};
			resetField('roles', {
				value: ['test'],
				deps: [['email', 'name']],
				validator: newValidator,
			});

			expect(get(values)).toEqual({ ...initialValues, roles: ['test'] });
			expect(get(deps)).toEqual({ ...initialDeps, roles: [['email', 'name']] });
			expect(get(validators)).toEqual({ ...initialValidators, roles: newValidator });
			expect(get(touched)).toEqual(initialTouched);
			expect(get(errors)).toEqual(initialErrors);
			expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
			expect(get(dirty)).toEqual(initialDirty);
		});
	});
});

it('testing proxies', () => {
	const values = {
		name: '',
	};

	const touched = {
		name: false,
	};

	const valuesProxy = new Proxy(values, {
		set(target, prop, value) {
			console.log('set', prop, value);
			if (prop === 'name') {
				touched.name = true;
				return true;
			}
			return Reflect.set(target, prop, value);
		},
	});

	valuesProxy.name = 'test';
	expect(values.name).toEqual('');
	expect(touched.name).toEqual(true);
});
