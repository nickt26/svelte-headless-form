import { getInternal } from './get';
import { setI } from './set';

export const appendI = <T extends object>(path: string, val: unknown, obj: T): T => {
	const res = getInternal(path, obj);
	if (Array.isArray(res)) setI(path, [...res, val], obj);
	return obj;
};
