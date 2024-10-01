import { describe, expect, it } from 'vitest';
import { mergeRightI } from '../../../internal/util/mergeRightDeep';

describe('mergeRightImpure', () => {
	it('should merge properties from the right object onto the left object and override any matching keys', () => {
		const left = {
			firstName: 'John',
			lastName: 'Doe',
			nested: {
				age: 20,
			},
			roles: ['admin', 'user'],
		};

		const right = {
			firstName: 'Jane',
			nested: {
				age: 30,
			},
		};

		mergeRightI(left, right);

		expect(left).toEqual({
			firstName: 'Jane',
			lastName: 'Doe',
			nested: {
				age: 30,
			},
			roles: ['admin', 'user'],
		});
	});

	it('should merge properties from the right object onto the left object and replace arrays', () => {
		const left = {
			firstName: 'John',
			lastName: 'Doe',
			nested: {
				age: 20,
			},
			roles: ['admin', 'user'],
		};

		const right = {
			roles: ['user'],
		};

		mergeRightI(left, right, { replaceArrays: true });

		expect(left.roles).toEqual(['user']);
	});

	it('should merge properties from the right object onto the left object but only for the same keys', () => {
		const left = {
			firstName: 'John',
			lastName: 'Doe',
			nested: {
				age: 20,
			},
			roles: ['admin', 'user'],
		};

		const right = {
			firstName: 'Jane',
			gender: 'Male',
			nested: {
				age: 30,
				height: 180,
			},
			deep: {
				weight: 80,
			},
		};

		mergeRightI(left, right, { onlySameKeys: true });

		expect(left).toEqual({
			firstName: 'Jane',
			lastName: 'Doe',
			nested: {
				age: 30,
			},
			roles: ['admin', 'user'],
		});
	});
});
