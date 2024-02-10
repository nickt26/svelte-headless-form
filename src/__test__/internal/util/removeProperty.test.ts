import { describe, expect, it } from 'vitest';
import { removePropertyImpure } from '../../../internal/util/removeProperty';

describe('removePropertyImpure', () => {
	it('should remove property from object', () => {
		const tester = {
			banana: 'lemon',
		};

		removePropertyImpure('banana', tester);

		expect(tester).toEqual({});
	});

	it('should remove element at index in array property', () => {
		const tester = {
			arr: [1, 2, 3],
		};

		removePropertyImpure('arr.2', tester);

		expect(tester.arr).toEqual([1, 2]);
	});

	it('should do nothing if prop is null along the path', () => {
		const tester = {
			nested: {
				arr: null,
			},
		};

		removePropertyImpure('nested.arr.3', tester);

		expect(tester).toEqual(tester);
	});

	it('should do nothing with primitive', () => {
		const tester = 123;

		// @ts-expect-error
		removePropertyImpure('arr.nested.3', tester);

		expect(tester).toEqual(tester);
	});

	it('should do nothing with nil [null]', () => {
		const tester = null;

		// @ts-expect-error
		removePropertyImpure('arr.nested.3', tester);

		expect(tester).toEqual(tester);
	});

	it('should do nothing with nil [undefined]', () => {
		const tester = undefined;

		// @ts-expect-error
		removePropertyImpure('arr.nested.3', tester);

		expect(tester).toEqual(tester);
	});

	it('should do nothing if path is incorrect', () => {
		const tester = {
			nested: {
				arr: [1, 2, 3],
			},
		};

		removePropertyImpure('nested.arr.prop', tester);

		expect(tester).toEqual(tester);
	});
});
