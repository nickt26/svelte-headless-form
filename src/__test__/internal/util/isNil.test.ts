import { describe, expect, it } from 'vitest';
import { isNil } from '../../../internal/util/isNil';

describe('isNil', () => {
	it('should return true for null', () => {
		expect(isNil(null)).toBe(true);
	});

	it('should return true for undefined', () => {
		expect(isNil(undefined)).toBe(true);
	});

	it('should not return true for not nil', () => {
		expect(isNil(123)).toBe(false);
	});
});
