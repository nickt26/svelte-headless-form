import type { ValidatorFn } from 'src/internal/types/Form';
import { getInternal } from 'src/internal/util/get';

export const prependImpure = <T extends object>(name: string, val: unknown, obj: T): T => {
	const res = getInternal<unknown[] | ValidatorFn<T>, T>(name, obj);
	if (Array.isArray(res)) res.unshift(val);
	return obj;
};
