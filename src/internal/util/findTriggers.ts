import { isObject } from './isObject';

export const findTriggers = (path: string, deps: any, currentPath = ''): string[] => {
	const triggers = [] as string[];
	for (const key in deps) {
		const pathToInsert = `${currentPath}${currentPath ? '.' : ''}${key}`;
		const val = deps[key] as string[];
		if (isObject(val) || (Array.isArray(val) && val.some((x) => isObject(x) || Array.isArray(x)))) {
			triggers.push(...findTriggers(path, val, pathToInsert));
			continue;
		}

		for (const dep of val) {
			if (path.startsWith(dep)) triggers.push(pathToInsert);
		}
	}

	return triggers;
};
