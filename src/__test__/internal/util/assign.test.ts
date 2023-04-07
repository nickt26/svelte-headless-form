import { describe, expect, it } from 'vitest';
import { assign, assignImpure } from '../../../internal/util/assign';

describe('assignImpure', () => {
	it('should have exact same object structure and same value', () => {
		const obj = {
			isCorrect: true,
			nested: {
				isCorrect: true
			},
			arr: [1, 2, 3]
		};

		const tester = {};
		assignImpure('', obj, tester);

		expect(tester).toEqual({
			isCorrect: '',
			nested: {
				isCorrect: ''
			},
			arr: ['', '', '']
		});
	});

	it('should have exact same object structure and refential equality for result and objToChange and referential inequality for each value when value is object', () => {
		type Obj = {
			isCorrect: true;
			isInCorrect: false;
		};
		const obj: Obj = {
			isCorrect: true,
			isInCorrect: false
		};

		type Tester = {
			isCorrect: {};
			isIncorrect: {};
		};
		const test = {};
		const tester = assignImpure({}, obj, test);

		expect(tester === test).toBeTruthy();
		expect((tester as Tester).isCorrect === (tester as Tester).isIncorrect).toBeFalsy();
	});
});

describe('assign', () => {
	it('should have object structure equality and referential inequality for result and input', () => {
		const obj = {
			isCorrect: true,
			nested: {
				isCorrect: true
			},
			arr: [1, 2, 3]
		};

		const tester = assign('', obj);

		expect(tester).not.toBe(obj);
		expect(tester).toEqual({
			isCorrect: '',
			nested: {
				isCorrect: ''
			},
			arr: ['', '', '']
		});
	});
});
