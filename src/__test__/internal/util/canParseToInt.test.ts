import { describe, expect, it } from 'vitest';
import { canParseToInt } from '../../../internal/util/canParseToInt';

describe('canParseToInt', () => {
	it('should not be parsable for non-number based string value', () => {
		expect(canParseToInt('Banana')).toBeFalsy();
	});

	it('should be parsable for number based string value', () => {
		expect(canParseToInt('123')).toBeTruthy();
	});

	it('should not be parsable for nil value', () => {
		expect(canParseToInt(null)).toBeFalsy();
	});
});
