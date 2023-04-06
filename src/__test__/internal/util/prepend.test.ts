import { prependImpure } from 'src/internal/util/prepend';
import { describe, expect, it } from 'vitest';

describe('prependImpure', () => {
	it('should prepend array property', () => {
		const obj = {
			arr: [1, 2, 3]
		};

		prependImpure('arr', 4, obj);

		expect(obj).toEqual({
			arr: [4, 1, 2, 3]
		});
	});

	it('should not do anything to non-array property', () => {
		const obj = {
			banana: 'lemon'
		};

		prependImpure('banana', 'apple', obj);

		expect(obj).toEqual({
			banana: 'lemon'
		});
	});

	it('should not do anything when path is incorrect', () => {
		const obj = {
			nested: {
				arr: [1, 2, 3]
			}
		};

		prependImpure('nested.ar', 4, obj);

		expect(obj.nested.arr).toEqual([1, 2, 3]);
	});
});
