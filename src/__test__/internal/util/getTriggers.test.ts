import { describe, expect, it } from 'vitest';
import { createTriggers } from '../../../internal/util/createTriggers';
import { getTriggers } from '../../../internal/util/get';
import { DependencyFields } from '../../../types/Form';

describe('getTriggers', () => {
	it('should extract triggers array', () => {
		const formValues = {
			firstName: 'John',
			age: 20,
		};
		const formDeps: DependencyFields<typeof formValues> = {
			firstName: ['age'],
		};
		const formTriggers = createTriggers(formValues, formDeps);

		const result = getTriggers('firstName', formTriggers);

		expect(result).toEqual(['age']);
	});
});
