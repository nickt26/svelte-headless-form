import { describe, expect, it } from 'vitest';
import { createForm } from '../../core/createForm';

//TODO: Write tests for createForm
describe('createForm', () => {
	it('should create a form', () => {
		const form = createForm({
			initialValues: {
				name: '',
				email: '',
			},
		});

		expect(form).toBeDefined();
	});
});
