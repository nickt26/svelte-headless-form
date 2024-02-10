import { describe, expect, it } from 'vitest';
import { isObject } from '../../../internal/util/isObject';

describe('isObject', () => {
	it('should return true for object', () => {
		expect(isObject({})).toBe(true);
	});

	it('should return false for nil [null]', () => {
		expect(isObject(null)).toBe(false);
	});

	it('should return false for nil [undefined]', () => {
		expect(isObject(undefined)).toBe(false);
	});

	it('should return false for primitive [number]', () => {
		expect(isObject(0)).toBe(false);
	});

	it('should return false for primitive [string]', () => {
		expect(isObject('')).toBe(false);
	});
});
