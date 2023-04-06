import { ValidatorFields } from 'src/internal/types/Form';
import { isFormValidImpure } from 'src/internal/util/isFormValid';
import { describe, expect, it } from 'vitest';

describe('isFormValidImpure', () => {
	it('should return true and no errors for valid form', () => {
		const formValues = {
			name: 'John',
			age: 20,
			email: 'johndoe@gmail.com',
			lastName: 'Doe',
			location: {
				lat: 123,
				lng: 123
			}
		};
		const formValidators: ValidatorFields<typeof formValues> = {
			name: (value) => (value.length > 0 ? false : 'Name is required'),
			age: (value: number) => (value > 18 ? false : 'Age must be greater than 18'),
			email: (value: string) => (value.includes('@') ? false : 'Email must contain @'),
			lastName: (value: string) => (value.length > 0 ? false : 'Last name is required'),
			location: {
				lat: (value: number) => (value > 0 ? false : 'Latitude must be greater than 0'),
				lng: (value: number) => (value > 0 ? false : 'Longitude must be greater than 0')
			}
		};

		expect(isFormValidImpure(formValues, formValues, formValidators)).toEqual([
			true,
			{
				name: false,
				age: false,
				email: false,
				lastName: false,
				location: {
					lat: false,
					lng: false
				}
			}
		]);
	});

	it('should return false and error strings for invalid form', () => {
		const formValues = {
			name: '',
			age: 10,
			email: 'johndoe@gmail.com',
			lastName: 'Doe',
			location: {
				lat: 0,
				lng: 0
			}
		};
		const formValidators: ValidatorFields<typeof formValues> = {
			name: (value) => (value.length > 0 ? false : 'Name is required'),
			age: (value: number) => (value > 18 ? false : 'Age must be greater than 18'),
			email: (value: string) => (value.includes('@') ? false : 'Email must contain @'),
			lastName: (value: string) => (value.length > 0 ? false : 'Last name is required'),
			location: {
				lat: (value: number) => (value > 0 ? false : 'Latitude must be greater than 0'),
				lng: (value: number) => (value > 0 ? false : 'Longitude must be greater than 0')
			}
		};

		expect(isFormValidImpure(formValues, formValues, formValidators)).toEqual([
			false,
			{
				name: 'Name is required',
				age: 'Age must be greater than 18',
				email: false,
				lastName: false,
				location: {
					lat: 'Latitude must be greater than 0',
					lng: 'Longitude must be greater than 0'
				}
			}
		]);
	});
});
