import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { FieldNotFoundError, getInternalSafe } from '../../internal/util/get';
import { setImpure } from '../../internal/util/set';
import { type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import {
	FormValues,
	ValueUpdate,
	formValidators,
	waitForAllFieldsToValidate,
} from './createFormUtils';

describe('resetField', () => {
	it('[Primitive] should reset values, deps & validators', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const { resetField, values, deps, errors, dirty, touched, validators } = form;

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

		expect(get(values).name).toEqual('');
		expect(get(touched).name).toEqual(false);
		expect(getInternalSafe('name', get(errors))).toBeInstanceOf(FieldNotFoundError);
		expect(get(dirty).name).toEqual(false);
		expect(get(validators).name).toEqual(formValidators.name);
		expect(get(deps).name).toEqual([]);
	});

	it('[Array] should reset values, deps & validators', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const { resetField, values, deps, errors, dirty, touched, validators } = form;

		const valueUpdate: ValueUpdate = [{ key: 'roles', value: ['user', 'admin', 'tester'] }];
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

		expect(get(values).roles).toEqual(['user']);
		expect(get(touched).roles).toEqual([false]);
		expect(getInternalSafe('roles', get(errors))).toBeInstanceOf(FieldNotFoundError);
		expect(get(dirty).roles).toEqual([false]);
		expect(get(validators).roles).toEqual([undefined]);
		expect(get(deps).roles).toEqual([[]]);
	});
});
