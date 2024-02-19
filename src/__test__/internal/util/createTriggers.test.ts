import { describe, expect, it } from 'vitest';
import { createTriggers } from '../../../internal/util/createTriggers';
import { AllFields, DependencyFields, TriggerFields } from '../../../types/Form';

type FormValues = {
	firstName: string;
	middleNames: string[];
	lastName: string;
	age: number;
	allRolesAreUnique: boolean;
	extra: {
		location: {
			unitNumber?: string;
			streetName: string;
			streetNumber: number;
			suburb: string;
			city: string;
			country: string;
			postCode: number;
			coords: {
				lat: number;
				lng: number;
			};
		};
		roles: { value: string; name: string }[] | string[][];
	};
};

const formValues: FormValues = {
	firstName: 'John',
	lastName: 'Smith',
	age: 20,
	allRolesAreUnique: true,
	extra: {
		location: {
			unitNumber: '1',
			streetName: 'Main',
			streetNumber: 123,
			suburb: 'Suburb',
			city: 'City',
			country: 'Country',
			postCode: 1234,
			coords: {
				lat: 0,
				lng: 0,
			},
		},
		roles: [
			{ value: 'admin', name: 'Admin' },
			{ value: 'user', name: 'User' },
			{ value: 'guest', name: 'Guest' },
		],
	},
	middleNames: ['Doe', 'Banana'],
};

// support:
// - star paths
// - AllFields
// - keys on objects in addition to Triggers and Values (no longer needed)
// - following triggers through star path objects

// Circular deps/Infinite loops: field repeats it's own path, nested value starts with a portion of it's own path, 2 fields depend on each other

// const res = setTriggerImpure('extra.*.*.label', ['extra.banana.lat'], {});
/*
			{
				extra: {
					[Values]: {
						[Star]: {
							[Triggers]: [],
							[Values]: {
								[Star]: {
									[Triggers]: [],
									[Values]: {
										label: ['extra.banana.lat']
									}
								}
							}
						}
					}
				}
			}
		*/
describe('createTriggers', () => {
	it('should convert deps into triggers correctly - only 1 dep', () => {
		const deps: DependencyFields<FormValues> = {
			firstName: ['age'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			age: ['firstName'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('should convert deps into triggers corretly - multiple deps', () => {
		const deps: DependencyFields<FormValues> = {
			firstName: ['age'],
			lastName: ['firstName', 'age'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			age: ['firstName', 'lastName'],
			firstName: ['age'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('should convert deps into triggers corretly - AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			middleNames: {
				[AllFields]: ['firstName', 'lastName'],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['middleNames'],
			lastName: ['middleNames'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});
});
