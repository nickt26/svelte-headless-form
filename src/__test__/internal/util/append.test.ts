import { describe, expect, it } from 'vitest';
import { appendI } from '../../../internal/util/append';

describe('appendImpure', () => {
	it('should append to array property', () => {
		const obj = {
			arr: [1, 2, 3],
		};

		appendI('arr', 4, obj);

		expect(obj).toEqual({
			arr: [1, 2, 3, 4],
		});
	});

	it('should not do anything to non-array property', () => {
		const obj = {
			banana: 'lemon',
		};

		appendI('banana', 'apple', obj);

		expect(obj).toEqual({
			banana: 'lemon',
		});
	});

	it('should not do anything when path is incorrect', () => {
		const obj = {
			nested: {
				arr: [1, 2, 3],
			},
		};

		appendI('nested.ar', 4, obj);

		expect(obj.nested.arr).toEqual([1, 2, 3]);
	});
});
