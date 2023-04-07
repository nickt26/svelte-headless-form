import { describe, expect, it } from 'vitest';
import { isObject } from '../../../internal/util/isObject';

describe('isObject', () => {
	it('should return true for object', () => {
		expect(isObject({})).toBe(true);
	});

	it('should return false for nil', () => {
		expect(isObject(null)).toBe(false);
	});

	it('should return false for primitive number', () => {
		expect(isObject(123)).toBe(false);
	});

	it('should return false for primitive string', () => {
		expect(isObject('123')).toBe(false);
	});

	it('should return false for primitive big int', () => {
		expect(isObject(123_000)).toBe(false);
	});
});
