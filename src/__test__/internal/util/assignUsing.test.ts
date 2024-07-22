import { describe, expect, it } from 'vitest';
import { assignUsing } from '../../../internal/util/assign';

describe('assignUsing', () => {
	it('should only have values where keys overlapped', () => {
		const left = {
			a: 1,
			b: 2,
			c: {
				a: 5,
			},
		};

		const right = {
			b: 3,
			c: {
				a: 2,
				b: 3,
			},
		};

		const result = assignUsing(left, right);

		expect(result).toEqual({
			b: 3,
			c: {
				a: 2,
			},
		});
	});

	it('should only have values where keys overlapped and exceptions', () => {
		const left = {
			a: 1,
			b: 2,
			c: {
				a: 5,
			},
		};
		const yes = Symbol('yes');
		const no = Symbol('no');

		const right = {
			b: 3,
			c: {
				a: 2,
				b: 3,
			},
			[yes]: {
				d: 4,
			},
			[no]: { a: 2, b: [1, 2, 3], c: { d: [4, 5] } },
		};

		const result = assignUsing(left, right, { compare: [yes, no] });

		expect(result).toEqual({
			b: 3,
			c: {
				a: 2,
			},
			[no]: { a: 2 },
			// a: 2,
			// [yes]: {
			// 	a: 2,
			// },
		});
	});
});
