import { describe, expect, it } from 'vitest';
import { clone } from '../../../internal/util/clone';

describe('clone', () => {
	it('should have refererential inequality and deep equality for objects', () => {
		const obj = {
			arr: [1, 2, 3]
		};

		const tester = clone(obj);

		expect(obj).not.toBe(tester);
		expect(obj).toEqual(tester);
	});

	it('should have referenital inequality and deep equality for arrays', () => {
		const arr = [1, 2, 3];
		const tester = clone(arr);

		expect(arr === tester).toBeFalsy();
		expect(arr).toEqual(tester);
	});

	it('should have referenital inequality and deep equality for dates', () => {
		const date = new Date();
		const tester = clone(date);

		expect(date === tester).toBeFalsy();
		expect(date).toEqual(tester);
	});

	it('should return same value for nil', () => {
		const test = null;
		const tester = clone(test);

		expect(test === tester).toBeTruthy();
	});

	it('should return same value for strings', () => {
		const test = '123';
		const tester = clone(test);

		expect(test === tester).toBeTruthy();
	});

	it('should return same value for numbers', () => {
		const test = 123;
		const tester = clone(test);

		expect(test === tester).toBeTruthy();
	});

	it('should return same value for big ints', () => {
		const test = 123_000;
		const tester = clone(test);

		expect(test === tester).toBeTruthy();
	});
});
