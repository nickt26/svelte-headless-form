import type { PartialFormObject } from 'src/types/Form';
import { appendImpure } from 'src/util/append';
import { getInternal } from 'src/util/get';
import { isNil } from 'src/util/isNil';
import { isObject } from 'src/util/isObject';
import { setImpure } from 'src/util/set';

export const invertDeps = <T extends object>(
	deps: any,
	currentKey = '',
	triggers: any = {}
): PartialFormObject<T, string[]> => {
	const keys = Object.keys(deps);
	for (const key of keys) {
		const val = deps[key];
		if ((Array.isArray(val) && val.some((x) => Array.isArray(x))) || isObject(val)) {
			invertDeps(val, `${currentKey}${currentKey.length !== 0 ? '.' : ''}${key}`, triggers);
			continue;
		}

		if (Array.isArray(val)) {
			for (const dep of val) {
				const pathToCurrentKey = `${currentKey}${currentKey.length !== 0 ? '.' : ''}${key}`;
				// console.log(`(${dep}, ${pathToCurrentKey})`);
				if (isNil(getInternal(dep, triggers))) setImpure(dep, [pathToCurrentKey], triggers);
				else appendImpure(dep, pathToCurrentKey, triggers);
			}
		}
	}
	return triggers;
};
