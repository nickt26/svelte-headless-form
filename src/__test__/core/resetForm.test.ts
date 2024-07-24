import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { setImpure } from '../../internal/util/set';
import { type Form as FormType } from '../../types/Form';
import Form from '../components/Form.svelte';
import { FormValues, ValueUpdate, waitForAllFieldsToValidate } from './createFormUtils';

describe('resetForm', () => {
	it('should reset form with no options', async () => {
		const { component } = render(Form);
		const { form } = component.$capture_state() as unknown as { form: FormType<FormValues> };
		const {
			values,
			deps,
			errors,
			dirty,
			touched,
			validators,
			initialValidators,
			initialDeps,
			initialValues,
			initialDirty,
			initialErrors,
			initialTouched,
			resetForm,
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

		resetForm();

		expect(get(values)).toEqual(initialValues);
		expect(get(touched)).toEqual(initialTouched);
		expect(get(errors)).toEqual(initialErrors);
		expect(get(dirty)).toEqual(initialDirty);
		expect(get(validators)).toEqual(initialValidators);
		expect(get(deps)).toEqual(initialDeps);
	});
});
