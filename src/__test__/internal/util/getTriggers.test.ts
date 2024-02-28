import { describe, expect, it } from 'vitest';
import { createTriggers } from '../../../internal/util/createTriggers';
import { getTriggers2 } from '../../../internal/util/get';
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

describe('getTriggers', () => {
	it('should extract triggers array', () => {
		const formDeps: DependencyFields<FormValues> = {
			firstName: ['age'],
		};
		const formTriggers = createTriggers(formValues, formDeps);

		const result = getTriggers2('age', formTriggers);

		expect(result).toEqual(['firstName']);
	});

	it('should extract triggers array - nested', () => {
		const formDeps: DependencyFields<FormValues> = {
			firstName: ['age'],
			extra: {
				location: {
					coords: {
						lng: ['age'],
					},
				},
			},
		};
		const formTriggers = createTriggers(formValues, formDeps);

		const result = getTriggers2('age', formTriggers);

		expect(result).toEqual(['firstName', 'extra.location.coords.lng']);
	});

	it('should extract triggers array - star', () => {
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
						[Star]: {
							name: ['extra.location.coords.lat', 'extra.location'],
						},
						[Triggers]: ['extra.location.coords.lng'],
					},
				},
			},
		};

		const triggers1 = getTriggers2('extra.location.city', formTriggers);
		const triggers2 = getTriggers2('extra.location.coords.lat', formTriggers);
		const triggers3 = getTriggers2('extra.location.coords.lng', formTriggers);
		const triggers4 = getTriggers2('extra.location.postCode', formTriggers);
		const triggers5 = getTriggers2('extra.location.coords', formTriggers);
		const triggers6 = getTriggers2('extra.roles.0.name', formTriggers);
		const triggers7 = getTriggers2('extra.roles', formTriggers);
		const triggers8 = getTriggers2('extra.roles.0.value', formTriggers);

		expect(triggers1).toEqual(['extra.roles.0.name']);
		expect(triggers2).toEqual([
			'extra.location.city',
			'extra.location.unitNumber',
			'extra.roles',
			'extra.roles.0.value',
		]);
		expect(triggers3).toEqual([
			'extra.location.city',
			'extra.location.unitNumber',
			'extra.roles.0.value',
		]);
		expect(triggers4).toEqual(['extra.location.coords.lng']);
		expect(triggers5).toEqual(['extra.roles.0.value']); // TODO: rethink this scenario, we might want parents to include all triggers of their children, don't know how this would affect the check for circular/infinite/invalid deps
		expect(triggers6).toEqual([
			'extra.location.coords.lng',
			'extra.location.coords.lat',
			'extra.location',
		]);
		expect(triggers7).toEqual(['extra.location.coords.lng']);
		expect(triggers8).toEqual(['extra.location.coords.lng']);
	});
});
