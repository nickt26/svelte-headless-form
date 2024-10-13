import { isObject } from './isObject';

export const someDeep = <T>(cb: (value: unknown) => boolean, val: T | undefined): boolean => {
	if (!isObject(val) && !Array.isArray(val)) return cb(val);
	const values = Object.values(val);

	for (let i = 0; i < values.length; i++) {
		if (cb(values[i])) return true;
		// if (!(isObject(values[i]) || Array.isArray(values[i]))) continue;
		// const res = someDeep(cb, values[i]);

		if (isObject(values[i]) || Array.isArray(values[i])) {
			if (someDeep(cb, values[i])) return true;
		}
	}

	return false;
};
