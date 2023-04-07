import { describe, expect, it } from 'vitest';
import { mergeRightDeepImpure } from '../../../internal/util/mergeRightDeep';

describe('mergeRightImpure', () => {
	it('should merge properties from the right object onto the left object and override any matching keys', () => {
		const left = {
			a: 1,
			b: 2,
			c: {
				a: 1,
				b: 2
			}
		};

		const right = {
			b: 3,
			c: {
				a: 4
			},
			d: 5
		};

		mergeRightDeepImpure(left, right);

		expect(left).toEqual({
			a: 1,
			b: 3,
			c: {
				a: 4,
				b: 2
			},
			d: 5
		});
	});
});
