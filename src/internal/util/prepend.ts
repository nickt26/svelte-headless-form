import { getInternal } from './get';
import { setI } from './set';

export const prependI = <T extends object>(name: string, val: unknown, obj: T): T => {
	const res = getInternal(name, obj);
	if (Array.isArray(res)) return setI(name, [val, ...res], obj);
	return obj;
};
