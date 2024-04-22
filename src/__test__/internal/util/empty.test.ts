import { describe, expect, it } from 'vitest';
import { empty } from '../../../internal/util/empty';

describe('empty', () => {
	it('should have referential inequality and deep inequality for objects', () => {
		const obj = {
			arr: [1, 2, 3]
		};

		const tester = empty(obj);

		expect(obj).not.toBe(tester);
		expect(obj).not.toEqual(tester);
	});

	it('should have referential inequality and deep inequality for arrays', () => {
		const arr = [1, 2, 3];
		const tester = empty(arr);

		expect(arr).not.toBe(tester);
		expect(arr).not.toEqual(tester);
	});

	it('should have deep inequality for strings', () => {
		const str = '123';
		const tester = empty(str);

		expect(str).not.toEqual(tester);
	});

	it('should be undefined', () => {
		const tester = empty(0);

		expect(tester).toEqual(undefined);
	});
});
