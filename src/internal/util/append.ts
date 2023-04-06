import { getInternal } from 'src/internal/util/get';

export const appendImpure = <T extends object>(path: string, val: unknown, obj: T): T => {
	const res = getInternal<unknown[], T>(path, obj);
	if (Array.isArray(res)) res.push(val);
	return obj;
};
