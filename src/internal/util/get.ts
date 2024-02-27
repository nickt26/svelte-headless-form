import { Equals, Star, TriggerFields, Triggers, Values } from '../../types/Form';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const getInternal = function <V = unknown, T extends object = object>(
	path: string,
	obj: T,
): Equals<V, unknown> extends true ? {} | null | undefined : V | undefined {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string')
		return undefined;

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (isNil(current[key]) || (!isObject(current[key]) && !Array.isArray(current[key])))
			return undefined;
		current = current[key];
	}
	const last = splitPath[splitPath.length - 1];
	return current[last] as V;
};

// export const getTriggers = function <T extends object = object>(
// 	path: string,
// 	obj: TriggerFields<T>,
// ): string[] | undefined {
// 	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string')
// 		return undefined;

// 	let current: any = obj;
// 	const splitPath = path.split(/\./g);

// 	for (let i = 0; i < splitPath.length - 1; i++) {
// 		const key = splitPath[i];
// 		if (
// 			isNil(current[key]?.[Values]) ||
// 			(!isObject(current[key]?.[Values]) && !Array.isArray(current[key]?.[Values]))
// 		)
// 			return undefined;
// 		current = current[key][Values];
// 	}
// 	const last = splitPath[splitPath.length - 1];
// 	const result = current[last];

// 	if (isObject(result)) return result?.[Triggers] as string[];

// 	return current[last];
// };

export const getTriggers = function <T extends object = object>(
	path: string,
	obj: TriggerFields<T>,
): string[] | undefined {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string')
		return undefined;

	const triggers = new Set<string>();

	let current: any = obj;
	const currentStar: Array<[boolean, any]> = [];
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];

		// if (
		// 	isNil(current[key]?.[Values]) ||
		// 	(!isObject(current[key]?.[Values]) && !Array.isArray(current[key]?.[Values]))
		// )
		// 	return undefined;

		if (Array.isArray(current[key]?.[Triggers]))
			for (const trigger of current[key][Triggers]) triggers.add(trigger);

		for (let j = 0; j < currentStar.length; j++) {
			const star = currentStar[j][1];
			const shouldSkipIteration = currentStar[j][0];
			if (Array.isArray(star[key]?.[Triggers])) {
				for (const trigger of star[key][Triggers]) triggers.add(trigger);
			}

			if (shouldSkipIteration) {
				currentStar[j][0] = false;
				continue;
			} else if (isObject(star[key]) || Array.isArray(star[key])) {
				currentStar[j] = star[key];
			} else {
				currentStar[j] = star[key][Values];
			}
		}
		// if (Array.isArray(currentStar[key]?.[Triggers])) {
		// 	for (const trigger of currentStar[key][Triggers]) triggers.add(trigger);
		// }

		if (isObject(current[key]?.[Star]) || Array.isArray(current[key]?.[Star])) {
			currentStar.push([true, current[key][Star]]);
			// current = current[key][Star];
		}

		// for (const star of currentStar) {
		// }
		// else {
		// current = current[key][Values];
		// }

		if (isNil(current[key][Values])) current = current[key][Star];
		else current = current[key][Values];
	}

	const last = splitPath[splitPath.length - 1];
	const result = current[last];

	if (Array.isArray(result?.[Triggers]))
		for (const trigger of result[Triggers]) triggers.add(trigger);
	else if (Array.isArray(result)) for (const trigger of result) triggers.add(trigger);

	return Array.from(triggers);
};

export const getTriggers2 = <T extends object>(
	path: string | Array<string>,
	obj: TriggerFields<T>,
	triggers: Set<string> = new Set(),
): Array<string> | undefined => {
	if (path.length === 0) return Array.from(triggers);
	const splitPath = Array.isArray(path) ? path : path.split(/\./g).reverse();

	const key = splitPath.pop()!;

	if (!(key in obj)) return undefined;
	const current = (obj as any)[key];

	if (splitPath.length === 0) {
		const current = (obj as any)[key];
		if (Array.isArray(current?.[Triggers]))
			for (const trigger of current[Triggers]) triggers.add(trigger);
		else if (Array.isArray(current)) for (const trigger of current) triggers.add(trigger);
	}

	if (Array.isArray(current?.[Triggers]))
		for (const trigger of current[Triggers]) triggers.add(trigger);

	if ((isObject(current) || Array.isArray(current)) && !(Values in current) && !(Star in current)) {
		getTriggers2(splitPath, current as TriggerFields, triggers);
	}

	if (isObject(current?.[Star]) || Array.isArray(current?.[Star])) {
		getTriggers2(splitPath.slice(0, -1), current[Star] as TriggerFields, triggers);
	}

	if (isObject(current?.[Values]) || Array.isArray(current?.[Values])) {
		getTriggers2(splitPath, current[Values] as TriggerFields, triggers);
	}

	return Array.from(triggers);
};
