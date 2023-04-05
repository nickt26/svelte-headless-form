import { getInternal } from 'src/util/get';

export const appendImpure = <T extends object>(pathToArr: string, val: unknown, obj: T): T => {
	const res = getInternal<unknown[], T>(pathToArr, obj);
	if (Array.isArray(res)) res.push(val);
	return obj;
};
