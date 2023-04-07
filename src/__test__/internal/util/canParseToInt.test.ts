import { describe, expect, it } from 'vitest';
import { canParseToInt } from '../../../internal/util/canParseToInt';

describe('canParseToInt', () => {
	it('should not be parsable for non-number based string value', () => {
		const test = 'Banana';

		expect(canParseToInt(test)).toBeFalsy();
	});

	it('should be parsable for number based string value', () => {
		const test = '123';

		expect(canParseToInt(test)).toBeTruthy();
	});

	it('should not be parsable for nil value', () => {
		const test = null;

		// @ts-expect-error
		expect(canParseToInt(test)).toBeFalsy();
	});
});
