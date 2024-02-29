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

export const getTriggers = <T extends object>(
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
		getTriggers(splitPath, current as TriggerFields, triggers);
	}

	if (isObject(current?.[Star]) || Array.isArray(current?.[Star])) {
		getTriggers(splitPath.slice(0, -1), current[Star] as TriggerFields, triggers);
	}

	if (isObject(current?.[Values]) || Array.isArray(current?.[Values])) {
		getTriggers(splitPath, current[Values] as TriggerFields, triggers);
	}

	return Array.from(triggers);
};
