import { describe, expect, it } from 'vitest';
import { isNil } from '../../../internal/util/isNil';

describe('isNil', () => {
	it('should return true for null', () => {
		expect(isNil(null)).toBe(true);
	});

	it('should return true for undefined', () => {
		expect(isNil(undefined)).toBe(true);
	});

	it('should not return true for not nil [number]', () => {
		expect(isNil(0)).toBe(false);
	});

	it('should not return true for not nil [string]', () => {
		expect(isNil('')).toBe(false);
	});

	it('should not return true for not nil [boolean]', () => {
		expect(isNil(false)).toBe(false);
	});

	it('should not return true for not nil [object]', () => {
		expect(isNil({})).toBe(false);
	});

	it('should not return true for not nil [array]', () => {
		expect(isNil([])).toBe(false);
	});

	it('should not return true for not nil [NaN]', () => {
		expect(isNil(NaN)).toBe(false);
	});
});
