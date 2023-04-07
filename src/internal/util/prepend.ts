import { ValidatorFn } from '../../types/Form';
import { getInternal } from './get';

export const prependImpure = <T extends object>(name: string, val: unknown, obj: T): T => {
	const res = getInternal<unknown[] | ValidatorFn<T>>(name, obj);
	if (Array.isArray(res)) res.unshift(val);
	return obj;
};
