import { describe, expect, it } from 'vitest';
import { createTriggers } from '../../../internal/util/createTriggers';
import {
	AllFields,
	DependencyFields,
	Star,
	TriggerFields,
	Triggers,
	Values,
} from '../../../types/Form';

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
	financials: {
		annualGrossIncome: number;
		annualNetIncome: number;
		payslips: {
			month: string;
			year: number;
			grossIncome: number;
			netIncome: number;
		}[];
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
	financials: {
		annualGrossIncome: 10,
		annualNetIncome: 5,
		payslips: [
			{
				month: 'January',
				year: 2021,
				grossIncome: 1,
				netIncome: 0.5,
			},
			{
				month: 'February',
				year: 2021,
				grossIncome: 2,
				netIncome: 1,
			},
		],
	},
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
	it('[non-nested] should convert deps into triggers correctly - only 1 dep', () => {
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

	it('[non-nested] should convert deps into triggers correctly - multiple deps', () => {
		const deps: DependencyFields<FormValues> = {
			firstName: ['age'],
			lastName: ['firstName', 'age'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			age: ['firstName', 'lastName'],
			firstName: ['lastName'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[non-nested] should convert deps into triggers correctly - AllFields symbol', () => {
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

	it('[non-nested] should convert deps into triggers correctly - multiple deps & AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			middleNames: {
				[AllFields]: ['firstName', 'lastName'],
			},
			age: ['firstName'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['middleNames', 'age'],
			lastName: ['middleNames'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[non-nested] should convert deps into triggers correctly - obj dep', () => {
		const deps: DependencyFields<FormValues> = {
			age: ['extra'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Triggers]: ['age'],
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[non-nested] should convert deps into triggers correctly - star dep', () => {
		const deps: DependencyFields<FormValues> = {
			age: ['extra.*.city', 'extra.*.country'],
			extra: {
				location: {
					[AllFields]: ['extra.*.coords.lat'],
					postCode: ['extra.roles.*.name'],
				},
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Values]: {
					roles: {
						[Star]: {
							name: ['extra.location.postCode'],
						},
					},
				},
				[Star]: {
					city: ['age'],
					country: ['age'],
					coords: {
						[Values]: {
							lat: ['extra.location'],
						},
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested] should convert deps into triggers correctly - only 1 dep', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					city: ['firstName'],
				},
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['extra.location.city'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested] should convert deps into triggers correctly - multiple deps', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					city: ['firstName'],
				},
				roles: [
					{
						name: ['lastName', 'age'],
					},
				],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['extra.location.city'],
			lastName: ['extra.roles.0.name'],
			age: ['extra.roles.0.name'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested] should convert deps into triggers correctly - AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					[AllFields]: ['firstName'],
				},
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['extra.location'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested] should convert deps into triggers correctly - multiple deps & AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					[AllFields]: ['firstName'],
					unitNumber: ['lastName'],
				},
				roles: [
					undefined,
					{
						value: ['age'],
						name: ['firstName'],
					},
				],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			firstName: ['extra.location', 'extra.roles.1.name'],
			age: ['extra.roles.1.value'],
			lastName: ['extra.location.unitNumber'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[dep-nested] should convert deps into triggers correctly - only 1 dep', () => {
		const deps: DependencyFields<FormValues> = {
			firstName: ['extra.location.coords.lat'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Values]: {
					location: {
						[Values]: {
							coords: {
								[Values]: {
									lat: ['firstName'],
								},
							},
						},
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[dep-nested] should convert deps into triggers correctly - multiple deps', () => {
		const deps: DependencyFields<FormValues> = {
			firstName: ['extra.location.coords.lat'],
			lastName: ['extra.roles.0.name'],
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Values]: {
					location: {
						[Values]: {
							coords: {
								[Values]: {
									lat: ['firstName'],
								},
							},
						},
					},
					roles: {
						[Values]: [
							{
								[Values]: {
									name: ['lastName'],
								},
							},
						],
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[dep-nested] should convert deps into triggers correctly - AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			middleNames: {
				[AllFields]: ['extra.location.country'],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Values]: {
					location: {
						[Values]: {
							country: ['middleNames'],
						},
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[dep-nested] should convert deps into triggers correctly - multiple deps & AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			middleNames: {
				[AllFields]: ['extra.location.country'],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				[Values]: {
					location: {
						[Values]: {
							country: ['middleNames'],
						},
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested & dep-nested] should convert deps into triggers correctly - only 1 dep', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					coords: {
						lat: ['financials.payslips.0.grossIncome'],
					},
				},
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			financials: {
				[Values]: {
					payslips: {
						[Values]: [
							{
								[Values]: {
									grossIncome: ['extra.location.coords.lat'],
								},
							},
						],
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested & dep-nested] should convert deps into triggers correctly - multiple deps', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					coords: {
						lat: ['financials.payslips.0.grossIncome'],
					},
				},
			},
			financials: {
				payslips: [
					{
						month: ['extra.roles.0.name'],
					},
				],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			financials: {
				[Values]: {
					payslips: {
						[Values]: [
							{
								[Values]: {
									grossIncome: ['extra.location.coords.lat'],
								},
							},
						],
					},
				},
			},
			extra: {
				[Values]: {
					roles: {
						[Values]: [
							{
								[Values]: {
									name: ['financials.payslips.0.month'],
								},
							},
						],
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested & dep-nested] should convert deps into triggers correctly - AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					[AllFields]: ['financials.payslips.0.grossIncome'],
				},
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			financials: {
				[Values]: {
					payslips: {
						[Values]: [
							{
								[Values]: {
									grossIncome: ['extra.location'],
								},
							},
						],
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('[prop-nested & dep-nested] should convert deps into triggers correctly - multiple deps & AllFields symbol', () => {
		const deps: DependencyFields<FormValues> = {
			extra: {
				location: {
					[AllFields]: ['financials.payslips.0.grossIncome'],
				},
			},
			financials: {
				payslips: [
					{
						month: ['extra.location.postCode'],
						year: ['extra.location.postCode', 'extra.location.suburb'],
					},
				],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			financials: {
				[Values]: {
					payslips: {
						[Values]: [
							{
								[Values]: {
									grossIncome: ['extra.location'],
								},
							},
						],
					},
				},
			},
			extra: {
				[Values]: {
					location: {
						[Values]: {
							postCode: ['financials.payslips.0.month', 'financials.payslips.0.year'],
							suburb: ['financials.payslips.0.year'],
						},
					},
				},
			},
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});

	it('should work', () => {
		const formDeps: DependencyFields<FormValues> = {
			extra: {
				location: {
					[AllFields]: ['extra.roles.*.name'],
					city: ['extra.*.coords.lat', 'extra.location.*.lng'],
					unitNumber: ['extra.location.*.lat', 'extra.location.*.lng'],
					coords: {
						lat: ['extra.roles.*.name'],
						lng: ['extra.roles', 'extra.location.postCode'],
					},
				},
				roles: {
					[AllFields]: ['extra.location.*.lat'],
					[Values]: [
						{
							name: ['extra.*.city'],
							value: ['extra.location.coords'],
						},
					],
				},
			},
		};
		const formTriggers = createTriggers(formValues, formDeps);
		const expectedTriggers: TriggerFields<FormValues> = {
			extra: {
				[Star]: {
					city: ['extra.roles.0.name'],
					coords: {
						[Values]: {
							lat: ['extra.location.city'],
						},
					},
				},
				[Values]: {
					location: {
						[Star]: {
							lat: ['extra.location.unitNumber', 'extra.roles'],
							lng: ['extra.location.city', 'extra.location.unitNumber'],
						},
						[Values]: {
							postCode: ['extra.location.coords.lng'],
							coords: {
								[Triggers]: ['extra.roles.0.value'],
							},
						},
					},
					roles: {
						[Triggers]: ['extra.location.coords.lng'],
						[Star]: {
							name: ['extra.location', 'extra.location.coords.lat'],
						},
					},
				},
			},
		};

		expect(formTriggers).toBeTruthy();
		expect(formTriggers).toEqual(expectedTriggers);
	});
});
