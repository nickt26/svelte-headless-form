import { getInternal } from './get';
import { setImpure } from './set';

export const prependImpure = <T extends object>(name: string, val: unknown, obj: T): T => {
	const res = getInternal<Array<unknown>>(name, obj);
	if (Array.isArray(res)) {
		return setImpure(name, [val, ...res], obj);
	}
	return setImpure(name, val, obj);
};
