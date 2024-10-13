import { isObject } from '../../internal/util/isObject';
import { DotPaths, Form as FormType, PartialValidatorFields, ValueOf } from '../../types/Form';
import Form from '../components/Form.svelte';

export type FormValues = {
	name: string;
	email: string;
	roles: string[];
	location: {
		address: string;
		coords: {
			lat: number;
			lng: number;
		};
	};
};

export const initialFormValues = {
	name: '',
	email: '',
	roles: ['user'],
	location: {
		address: '123 Main St.',
		coords: {
			lat: 0,
			lng: 0,
		},
	},
} satisfies FormValues;

export const initialFormValidators = {
	name: (value) => !value.length && 'Required',
	email: (value) => !value.length && 'Required',
	location: {
		address: () => 'error',
		coords: {
			lat: () => 'error',
			lng: () => 'error',
		},
	},
} satisfies PartialValidatorFields<FormValues>;

export type ValueUpdate = Array<ValueUpdat>;

type ValueUpdat = {
	[TKey in DotPaths<FormValues>]: {
		key: TKey;
		value: ValueOf<FormValues, TKey>;
	};
}[DotPaths<FormValues>];

export function waitForAllFieldsToValidate(
	valueUpdates: ValueUpdate | Array<DotPaths<FormValues>>,
	form: FormType<FormValues>,
): Promise<void> {
	const { latestFieldEvent } = form;
	let counter = 0;
	return new Promise<void>((resolve) => {
		const fieldsThatHaveValidated: (string | PropertyKey[])[] = [];
		const unsub = latestFieldEvent.subscribe(async (x) => {
			console.log(x);
			if (
				x.event === 'afterValidate' &&
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
				) &&
				counter != 0
			) {
				fieldsThatHaveValidated.push(x.field);
				if (fieldsThatHaveValidated.length === valueUpdates.length) {
					unsub();
					resolve();
				}
			}
			counter += 1;
		});
	});
}

export function getComponentState(component: Form) {
	return component.$capture_state() as unknown as { form: FormType<FormValues> };
}
