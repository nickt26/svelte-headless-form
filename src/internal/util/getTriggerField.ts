import { TriggerFields, Values } from '../../types/Form';
import { isObject } from './isObject';

export const getTriggerField = <T extends object>(
	path: string | Array<string | number | symbol>,
	triggers: TriggerFields<T>,
) => {
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);
	let current: any = triggers;
	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		const next = current[key];
		if (!isObject(next?.[Values]) && !Array.isArray(next?.[Values])) return undefined;
		current = next[Values];
	}
	return current[splitPath[splitPath.length - 1]];
};
