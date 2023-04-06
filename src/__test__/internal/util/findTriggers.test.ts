import { findTriggers } from 'src/internal/util/findTriggers';
import { describe, expect, it } from 'vitest';

describe('findTriggers', () => {
	it('should find triggers for provided deps', () => {
		const deps = {
			a: ['b', 'c'],
			b: {
				a: ['a', 'c']
			},
			c: ['b', 'a']
		};

		const a_triggers = findTriggers('a', deps);
		const b_triggers = findTriggers('b', deps);
		const c_triggers = findTriggers('c', deps);
		expect(a_triggers).toContain('c');
		expect(a_triggers).toContain('b.a');
		expect(b_triggers).toContain('a');
		expect(b_triggers).toContain('c');
		expect(c_triggers).toContain('a');
		expect(c_triggers).toContain('b.a');
	});
});
