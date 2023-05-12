import { isObject } from './isObject';

export const someDeep = <T extends object>(cb: (value: unknown) => boolean, obj: T): boolean => {
	const values = Object.values(obj);
	if (values.some(cb)) return true;

	for (let i = 0; i < values.length; i++) {
		if (!(isObject(values[i]) || Array.isArray(values[i]))) continue;
		const res = someDeep(cb, values[i]);
		if (res) return true;
	}

	return false;
};
