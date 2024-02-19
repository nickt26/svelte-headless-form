import { Equals, TriggerFields, Triggers, Values } from '../../types/Form';
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

export const getTriggers = function <T extends object = object>(
	path: string,
	obj: TriggerFields<T>,
): string[] | undefined {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string')
		return undefined;

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (
			isNil(current[key]?.[Values]) ||
			(!isObject(current[key]?.[Values]) && !Array.isArray(current[key]?.[Values]))
		)
			return undefined;
		current = current[key][Values];
	}
	const last = splitPath[splitPath.length - 1];
	const result = current[last];

	if (isObject(result)) return result?.[Triggers] as string[];

	return current[last];
};

export const getTriggersAlongEntireTreePath = function <T extends object = object>(
	path: string,
	obj: TriggerFields<T>,
): string[] | undefined {
	if (isNil(obj) || (!isObject(obj) && !Array.isArray(obj)) || typeof path !== 'string')
		return undefined;

	const triggers = new Set<string>();

	let current: any = obj;
	const splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (
			isNil(current[key]?.[Values]) ||
			(!isObject(current[key]?.[Values]) && !Array.isArray(current[key]?.[Values]))
		)
			return undefined;

		if (Array.isArray(current[key]?.[Triggers]))
			for (const trigger of current[key][Triggers]) triggers.add(trigger);

		current = current[key][Values];
	}
	const last = splitPath[splitPath.length - 1];
	const result = current[last];

	if (isObject(result) && Array.isArray(result?.[Triggers]))
		for (const trigger of result[Triggers]) triggers.add(trigger);
	else if (Array.isArray(result)) for (const trigger of result) triggers.add(trigger);

	return Array.from(triggers);
};
