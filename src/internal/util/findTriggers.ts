// export const findTriggers = <T extends object>(
// 	path: string,
// 	deps: DependencyFieldsInternal<T>,
// 	currentPath = '',
// ): string[] => {
// 	const triggers = [] as string[];
// 	for (const key in deps) {
// 		const pathToInsert = `${currentPath}${currentPath.length !== 0 ? '.' : ''}${key}`;
// 		if (pathToInsert === path) continue;
// 		const val = deps[key as keyof typeof deps] as unknown;
// 		if (isObject(val) || (Array.isArray(val) && val.some((x) => isObject(x) || Array.isArray(x)))) {
// 			triggers.push(...findTriggers(path, val as DependencyFieldsInternal<T[keyof T] & object>, pathToInsert));
// 			continue;
// 		}

// 		for (const dep of val as string[]) if (path.startsWith(dep)) triggers.push(pathToInsert);
// 	}

// 	return triggers;
// };

// export const findAllTriggers = <T extends object>(
// 	path: string,
// 	deps: DependencyFieldsInternal<T>,
// 	currentPath = '',
// 	triggers = [] as string[],
// ): string[][] => {
// 	for (const key in deps) {
// 		const pathToInsert = `${currentPath}${currentPath.length !== 0 ? '.' : ''}${key}`;
// 		if (pathToInsert === path) continue;
// 		const val = deps[key as keyof typeof deps] as unknown;
// 		if (isObject(val) || (Array.isArray(val) && val.some((x) => isObject(x) || Array.isArray(x)))) {
// 			triggers.push(...findTriggers(path, val as DependencyFieldsInternal<T[keyof T] & object>, pathToInsert));
// 			continue;
// 		}

// 		for (const dep of val as string[]) if (path.startsWith(dep)) triggers.push(pathToInsert);
// 	}

// 	return triggers;
// };
