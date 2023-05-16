import { describe, expect, it } from 'vitest';
import { someDeep } from '../../../internal/util/someDeep';

describe('someDeep', () => {
	it('should return true if any value in object matches predicate', () => {
		const obj = {
			firstName: 'John',
			lastName: 'Doe',
			isMarried: false,
			nested: {
				gender: 'Male',
				age: 25,
			},
		};

		const res = someDeep((val) => val === 25, obj);

		expect(res).toBe(true);
	});

	it("should return false if any value in object doesn't match the predicate", () => {
		const obj = {
			firstName: 'John',
			lastName: 'Doe',
			age: 25,
		};

		const res = someDeep((val) => typeof val === 'boolean', obj);

		expect(res).toBe(false);
	});
});
