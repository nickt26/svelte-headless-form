import { isObject } from '../../internal/util/isObject';
import { DotPaths, Form as FormType, PartialValidatorFields } from '../../types/Form';
import Form from '../components/Form.svelte';

export type FormValues = {
	name: string;
	email: string;
	roles: string[];
};

export const formValues: FormValues = {
	name: '',
	email: '',
	roles: ['user'],
};

export const formValidators: PartialValidatorFields<FormValues> = {
	name: (value) => value.length === 0 && 'Required',
	email: (value) => value.length === 0 && 'Required',
};

export type ValueUpdate = Array<{ key: DotPaths<FormValues>; value: any }>;

export function waitForAllFieldsToValidate(
	valueUpdates: ValueUpdate | Array<DotPaths<FormValues>>,
	form: FormType<FormValues>,
): Promise<void> {
	const { latestFieldEvent } = form;
	return new Promise<void>((resolve) => {
		const fieldsThatHaveValidated: (string | (string | number | symbol)[])[] = [];
		const unsub = latestFieldEvent.subscribe(async (x) => {
			if (
				x?.event === 'afterValidate' &&
				valueUpdates.some(
					(val: { key: DotPaths<FormValues>; value: any } | DotPaths<FormValues>) => {
						const path = Array.isArray(x.field) ? x.field.join('.') : x.field;
						if (isObject(val)) {
							return val.key === path;
						}

						if (typeof val === 'string') {
							return val === path;
						}
					},
				)
			) {
				fieldsThatHaveValidated.push(x.field);
				if (fieldsThatHaveValidated.length === valueUpdates.length) {
					unsub();
					resolve();
				}
			}
		});
	});
}

export function getComponentState(component: Form) {
	return component.$capture_state() as unknown as { form: FormType<FormValues> };
}
