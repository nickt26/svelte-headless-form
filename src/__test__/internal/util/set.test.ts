import { describe, expect, it } from 'vitest';
import { setImpure } from '../../../internal/util/set';

describe('setImpure', () => {
	it('should change the property value', () => {
		const obj = {
			nested: {
				banana: 'lemon',
			},
		};

		setImpure('nested.banana', 'apple', obj);

		expect(obj.nested.banana).toEqual('apple');
	});

	it('should not do anything when path is incorrect', () => {
		const obj = {
			nested: {
				banana: 'lemon',
			},
		};

		setImpure('nested.apple', 'banana', obj);

		expect(obj.nested.banana).toEqual('lemon');
	});

	it('should not do anything when obj is nil', () => {
		const obj = null;

		// @ts-expect-error
		setImpure('nested.apple', 'banana', obj);

		expect(obj).toEqual(null);
	});

	it('should not do anything when obj is primitive', () => {
		const obj = 123;

		// @ts-expect-error
		setImpure('nested.apple', 'banana', obj);

		expect(obj).toEqual(123);
	});

	it('should have referential equality for the returned object', () => {
		const obj = {
			nested: {
				banana: 'lemon',
			},
		};

		const tester = setImpure('nested.banana', 'apple', obj);

		expect(obj).toBe(tester);
	});

	it('should correctly detect if the next element is an index to an array', () => {
		const obj = {
			nested: {},
		};

		setImpure('nested.apple.0', 3, obj);

		expect(obj).toEqual({ nested: { apple: [3] } });
	});
});
