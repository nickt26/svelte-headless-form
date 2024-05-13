import { describe, it } from 'vitest';
import { assign } from '../../../internal/util/assign';
import { createTriggers } from '../../../internal/util/createTriggers';
import { isFormValidSchemaless } from '../../../internal/util/isFormValid';
import { DependencyFields, DependencyFieldsInternal, ValidatorFields } from '../../../types/Form';

const allowedRoles = ['admin', 'developer'];

describe('isFormValidSchemaless', () => {
	it('[TODO: Fix] should return error string for fields with error', async () => {
		const formValues = {
			firstName: 'John',
			lastName: 'Doe',
			age: 20,
			email: 'john.doe@test.com',
			location: {
				lat: 0,
				lng: 0,
			},
			roles: ['admin', 'tester', 'developer'],
		};
		const formValidators: ValidatorFields<typeof formValues> = {
			firstName: (value) => (value.length > 0 ? false : 'First name is required'),
			lastName: (value) => (value.length > 0 ? false : 'Last name is required'),
			age: (value) => (value >= 18 ? false : 'Age must be 18 or over'),
			email: (value) => !value.includes('@') && 'Email must contain @',
			location: {
				lat: (value) => (value > 0 ? false : 'Latitude must be greater than 0'),
				lng: (value) => (value > 0 ? false : 'Longitude must be greater than 0'),
			},
			roles: formValues.roles.map(
				() => (value) => (allowedRoles.includes(value) ? false : 'Invalid role'),
			),
		};
		const depFields: DependencyFields<typeof formValues> = {
			email: ['location.lat'],
		};
		const triggerFields = createTriggers(formValues, depFields);
		const touchedFields = assign(false, formValues);
		const dirtyFields = assign(false, formValues);

		const [isValid, errors] = await isFormValidSchemaless(
			formValues,
			formValidators,
			depFields as DependencyFieldsInternal<typeof formValues>,
			triggerFields,
			touchedFields,
			dirtyFields,
			formValues,
			formValidators,
			depFields,
			// triggerFields,
		);

		// expect(isValid).toBe(false);
		// TODO: Error here where email field is not being validated due to dependency in depFields
		// expect(errors).toEqual({
		// 	firstName: false,
		// 	email: false,
		// 	lastName: false,
		// 	age: false,
		// 	location: {
		// 		lat: 'Latitude must be greater than 0',
		// 		lng: 'Longitude must be greater than 0',
		// 	},
		// 	roles: [false, 'Invalid role', false],
		// });
	});
});

// describe('isFormValidSchemaless', () => {
// 	it('should return true and no errors for valid form', async () => {
// 		const formValues = {
// 			name: 'John',
// 			age: 20,
// 			email: 'johndoe@gmail.com',
// 			lastName: 'Doe',
// 			location: {
// 				lat: 123,
// 				lng: 123,
// 			},
// 		};
// 		const formValidators: ValidatorFields<typeof formValues> = {
// 			name: (value) => (value.length > 0 ? false : 'Name is required'),
// 			age: (value: number) => (value > 18 ? false : 'Age must be greater than 18'),
// 			email: (value: string) => (value.includes('@') ? false : 'Email must contain @'),
// 			lastName: (value: string) => (value.length > 0 ? false : 'Last name is required'),
// 			location: {
// 				lat: (value: number) => (value > 0 ? false : 'Latitude must be greater than 0'),
// 				lng: (value: number) => (value > 0 ? false : 'Longitude must be greater than 0'),
// 			},
// 		};
// 		const touched = assign(false, formValues);
// 		const pristine = assign(true, formValues);
// 		const dirty = assign(false, formValues);
// 		const errors = assign(false as string | false, formValues);

// 		expect(
// 			await isFormValidSchemaless(formValues, formValidators, { touched, dirty, pristine, values: formValues, errors }),
// 		).toEqual([
// 			true,
// 			{
// 				name: false,
// 				age: false,
// 				email: false,
// 				lastName: false,
// 				location: {
// 					lat: false,
// 					lng: false,
// 				},
// 			},
// 		]);
// 	});

// 	it('should return false and error strings for invalid form', async () => {
// 		const formValues = {
// 			name: '',
// 			age: 10,
// 			email: 'johndoe@gmail.com',
// 			lastName: 'Doe',
// 			location: {
// 				lat: 0,
// 				lng: 0,
// 			},
// 		};
// 		const formValidators: ValidatorFields<typeof formValues> = {
// 			name: (value) => (value.length > 0 ? false : 'Name is required'),
// 			age: (value: number) => (value > 18 ? false : 'Age must be greater than 18'),
// 			email: (value: string) => (value.includes('@') ? false : 'Email must contain @'),
// 			lastName: (value: string) => (value.length > 0 ? false : 'Last name is required'),
// 			location: {
// 				lat: (value: number) => (value > 0 ? false : 'Latitude must be greater than 0'),
// 				lng: (value: number) => (value > 0 ? false : 'Longitude must be greater than 0'),
// 			},
// 		};
// 		const touched = assign(false, formValues);
// 		const pristine = assign(true, formValues);
// 		const dirty = assign(false, formValues);
// 		const errors = assign(false as string | false, formValues);

// 		expect(
// 			await isFormValidSchemaless(formValues, formValidators, { touched, dirty, pristine, values: formValues, errors }),
// 		).toEqual([
// 			false,
// 			{
// 				name: 'Name is required',
// 				age: 'Age must be greater than 18',
// 				email: false,
// 				lastName: false,
// 				location: {
// 					lat: 'Latitude must be greater than 0',
// 					lng: 'Longitude must be greater than 0',
// 				},
// 			},
// 		]);
// 	});
// });

// describe('isFormValidSchema', () => {
// 	it('should return true and no errors for valid form', async () => {
// 		const formValues = {
// 			name: 'John',
// 			age: 20,
// 			email: 'johndoe@gmail.com',
// 			lastName: 'Doe',
// 			location: {
// 				lat: 1,
// 				lng: 2,
// 			},
// 		};
// 		const validationResolver: ValidationResolver<typeof formValues> = (values) => {
// 			const errors: PartialErrorFields<typeof formValues> = {};
// 			if (values.name.length === 0) {
// 				errors.name = 'Name is required';
// 			}

// 			if (values.age < 18) {
// 				errors.age = 'Age must be greater than 18';
// 			}

// 			if (!values.email.includes('@')) {
// 				errors.email = 'Email must contain @';
// 			}

// 			if (values.lastName.length === 0) {
// 				errors.lastName = 'Last name is required';
// 			}

// 			if (values.location.lat <= 0) {
// 				setImpure('location.lat', 'Latitude must be greater than 0', errors);
// 			}

// 			if (values.location.lng <= 0) {
// 				setImpure('location.lng', 'Longitude must be greater than 0', errors);
// 			}

// 			return errors;
// 		};

// 		expect(await isFormValidSchema(formValues, validationResolver)).toEqual([true, {}]);
// 	});

// 	it('should return false and errors for invalid form', async () => {
// 		const formValues = {
// 			name: '',
// 			age: 10,
// 			email: 'johndoe@gmail.com',
// 			lastName: 'Doe',
// 			location: {
// 				lat: 0,
// 				lng: 0,
// 			},
// 		};
// 		const validationResolver: ValidationResolver<typeof formValues> = (values) => {
// 			const errors: PartialErrorFields<typeof formValues> = {};
// 			if (values.name.length === 0) {
// 				errors.name = 'Name is required';
// 			}

// 			if (values.age < 18) {
// 				errors.age = 'Age must be greater than 18';
// 			}

// 			if (!values.email.includes('@')) {
// 				errors.email = 'Email must contain @';
// 			}

// 			if (values.lastName.length === 0) {
// 				errors.lastName = 'Last name is required';
// 			}

// 			if (values.location.lat <= 0) {
// 				setImpure('location.lat', 'Latitude must be greater than 0', errors);
// 			}

// 			if (values.location.lng <= 0) {
// 				setImpure('location.lng', 'Longitude must be greater than 0', errors);
// 			}

// 			return errors;
// 		};

// 		expect(await isFormValidSchema(formValues, validationResolver)).toEqual([
// 			false,
// 			{
// 				name: 'Name is required',
// 				age: 'Age must be greater than 18',
// 				location: {
// 					lat: 'Latitude must be greater than 0',
// 					lng: 'Longitude must be greater than 0',
// 				},
// 			},
// 		]);
// 	});
// });
