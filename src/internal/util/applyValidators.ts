import { type ValidatorState } from '../../types/Form';
import { getError, getInternal } from './get';
import { isObject } from './isObject';
import { isPromise } from './isPromise';
import { setI } from './set';

export function applyValidatorI<T extends object>(
	validator: [Array<PropertyKey>, Function],
	values: T,
	errors: object,
): string | false | Promise<string | false> {
	const [path, fn] = validator;
	const value = getInternal(path, values);

	const validatorMethodResult = fn(value, {
		values,
		path: path.join('.'),
	} satisfies ValidatorState<T>);

	const onComplete = (res: string | false): string | false => {
		const error = getError(path, errors);
		if (!(error && typeof error === 'string' && typeof res === 'string')) {
			setI(path, res, errors);
		} else if ((isObject(value) && isObject(res)) || (Array.isArray(value) && Array.isArray(res))) {
			setI(path, res, errors);
		}

		return res;
	};

	if (isPromise(validatorMethodResult)) {
		return (async () => {
			const validatorResult = await validatorMethodResult;
			return onComplete(validatorResult);
		})();
	} else {
		return (() => {
			const validatorResult = validatorMethodResult;
			return onComplete(validatorResult);
		})();
	}
	// const validatorResult = isPromise(validatorMethodResult)
	// 	? await validatorMethodResult
	// 	: validatorMethodResult;

	// // const onComplete = (res: string | false): void => {
	// const error = getError(path, errors);
	// if (!(error && typeof error === 'string' && typeof validatorResult === 'string')) {
	// 	setImpure(path, validatorResult, errors);
	// } else if (
	// 	(isObject(value) && isObject(validatorResult)) ||
	// 	(Array.isArray(value) && Array.isArray(validatorResult))
	// ) {
	// 	setImpure(path, validatorResult, errors);
	// }

	// return validatorResult;
	// };

	// if (isPromise(validatorMethodResult)) return validatorMethodResult.then(onComplete);
	// else return onComplete(validatorMethodResult);

	// 	onComplete();
}
