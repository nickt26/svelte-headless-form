import { describe, expect, it } from 'vitest';
import { getInternal } from '../../../internal/util/get';

describe('getInternal', () => {
	it('should extract propery', () => {
		const obj = {
			arr: [
				{
					banana: 'lemon'
				}
			]
		};

		const tester = getInternal('arr.0.banana', obj);

		expect(tester).toEqual('lemon');
	});

	it('should return undefined when property path is incorrect', () => {
		const obj = {
			arr: [
				{
					banana: 'lemon'
				}
			]
		};

		const tester = getInternal('arr.0.banana.1', obj);

		expect(tester).toEqual(undefined);
	});

	it('should return undefined when property in path is nil', () => {
		const obj = {
			arr: null
		};

		const tester = getInternal('arr.0.banana.1', obj);

		expect(tester).toEqual(undefined);
	});

	it('should return undefined when object is nil', () => {
		const obj = null;

		// @ts-expect-error
		const tester = getInternal('arr.0.banana.1', obj);

		expect(tester).toEqual(undefined);
	});

	it('should return undefined when object is not an object or an array', () => {
		const obj = 123;

		// @ts-expect-error
		const tester = getInternal('arr.0.banana.1', obj);

		expect(tester).toEqual(undefined);
	});
});
