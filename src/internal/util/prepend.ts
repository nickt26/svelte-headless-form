import { noFormUpdate, noValidate } from './clone';
import { getInternal } from './get';
import { setI } from './set';

export const prependI = <T extends Record<PropertyKey, unknown>>(
	path: string,
	val: unknown,
	obj: T,
	preventUpdate?: boolean,
): T => {
	const res = getInternal(path, obj);
	if (Array.isArray(res))
		return setI(
			path,
			preventUpdate ? [{ [noValidate]: true, [noFormUpdate]: true }, [val, ...res]] : [val, ...res],
			obj,
		);
	return obj;
};
