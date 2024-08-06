import { type ValidatorState } from '../../types/Form';
import { getInternal } from './get';
import { isObject } from './isObject';
import { setImpure } from './set';

export async function applyValidatorImpure<T extends object>(
	validator: [Array<string | number | symbol>, Function],
	values: T,
	errors: object,
): Promise<string | false> {
	const [path, fn] = validator;
	const value = getInternal(path, values);

	const validatorResult = (await fn(value, {
		values,
		path: path.join('.'),
	} satisfies ValidatorState<T>)) as string | false;

	const error = getInternal(path, errors);
	if (!((isObject(value) || Array.isArray(value)) && typeof error === 'string')) {
		setImpure(path, validatorResult, errors);
	}

	return validatorResult;
}
