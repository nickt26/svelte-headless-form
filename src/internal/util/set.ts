import { Star, TriggerFields, Triggers, Values } from '../../types/Form';
import { canParseToInt } from './canParseToInt';
import { isNil } from './isNil';
import { isObject } from './isObject';

export const setImpure = <V, T extends object>(
	path: string | Array<string | number | symbol>,
	val: V,
	obj: T,
): T => {
	if (
		isNil(obj) ||
		(!isObject(obj) && !Array.isArray(obj)) ||
		!(typeof path === 'string' || Array.isArray(path))
	)
		return obj;

	let current: any = obj;
	const splitPath = Array.isArray(path) ? path : path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		let next = current[key];
		if (!isObject(next) && !Array.isArray(next)) {
			current[key] = canParseToInt(splitPath[i + 1]) ? [] : {};
			next = current[key];
		}
		current = next;
	}
	const last = splitPath[splitPath.length - 1];
	current[last] = val;
	return obj;
};

export const setTriggerImpure = <T extends object>(
	path: string,
	val: string,
	obj: TriggerFields<T>,
	makeObject: boolean = false,
): TriggerFields<T> => {
	if (isNil(obj) || !isObject(obj)) return obj;

	let current: any = obj;
	let splitPath = path.split(/\./g);

	for (let i = 0; i < splitPath.length - 1; i++) {
		const key = splitPath[i];
		if (key === '*') continue;

		const nextShouldBeArray = canParseToInt(splitPath[i + 1]);
		const nextIsStar = splitPath[i + 1] === '*';

		let next = current[key];

		if (nextIsStar) {
			if (isNil(next?.[Star])) {
				const nextNextIsArray = canParseToInt(splitPath[i + 2]);
				current[key] = {
					[Star]: nextNextIsArray ? [] : {},
				};
			}
			next = current[key][Star];
			current = next;
			continue;
		}

		if (
			(!isObject(next) && !Array.isArray(next)) ||
			((isObject(next) || Array.isArray(next)) && isNil(next[Values as any]))
		)
			current[key] = {
				...current[key],
				[Values]: nextShouldBeArray ? [] : {},
			};

		next = current[key][Values];

		current = next;
	}
	const lastKey = splitPath[splitPath.length - 1];
	if (makeObject) {
		if (Array.isArray(current[lastKey]?.[Triggers])) current[lastKey][Triggers].push(val as any);
		//TODO: Potential bug here, we aren't checking if current[lastKey] is an existing primitive value with triggers, potentially solve this with functional deps though
		else if (isNil(current[lastKey])) current[lastKey] = { [Triggers]: [val] };
		else current[lastKey][Triggers] = [val];
	} else if (Array.isArray(current[lastKey])) current[lastKey].push(val);
	else current[lastKey] = [val];

	return obj;
};
