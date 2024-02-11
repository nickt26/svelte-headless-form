import { describe, expect, it } from 'vitest';
import { createTriggers } from '../../../internal/util/createTriggers';
import { AllFields, DependencyFields, TriggerFields } from '../../../types/Form';

describe('createTriggers', () => {
	it('should convert deps into triggers correctly', () => {
		// type FormValues = {
		// 	firstName: string;
		// 	lastName: string;
		// 	age: number;
		// 	allRolesAreUnique: boolean;
		// 	extra: {
		// 		location: {
		// 			lat: number;
		// 			lng: number;
		// 		};
		// 		latlng: {
		// 			lat: number;
		// 			lng: number;
		// 		};
		// 		roles: { value: string; label: string }[] | string[];
		// 	};
		// 	middleNames: string[];
		// };
		const formValues = {
			firstName: 'John',
			lastName: 'Smith',
			age: 20,
			allRolesAreUnique: true,
			extra: {
				location: {
					lat: 0,
					lng: 0,
				},
				// latlng: {
				// 	lat: 0,
				// 	lng: 0,
				// },
				roles: [
					{ value: 'admin', label: 'Admin' },
					{ value: 'user', label: 'User' },
					{ value: 'guest', label: 'Guest' },
				],
			},
			middleNames: ['Doe', 'Banana'],
		};

		// Circular deps/Infinite loops: field repeats it's own path, nested value starts with a portion of it's own path, 2 fields depend on each other
		const deps: DependencyFields<typeof formValues> = {
			age: ['firstName'],
			firstName: ['extra.*.lat'],
			middleNames: {
				[AllFields]: ['firstName'],
				values: [['middleNames.0']],
			},
			extra: {
				[AllFields]: ['extra.roles.*.value'],
				roles: [{}],
			},
		};

		const result: TriggerFields<typeof formValues> = createTriggers(formValues, deps);
		const expected: TriggerFields<typeof formValues> = {
			extra: {
				values: {
					roles: {
						triggers: ['allRolesAreUnique'],
					},
				},
			},
			firstName: ['age'],
		};

		expect(result).toBeTruthy();
		expect(result).toEqual(expected);
	});
});
