import { clone } from '../../internal/util/clone';
import { removeImpure } from './remove';

// TODO: figure out how to mix and match dot path arrays and a path made up of an array
export function exclude<T extends object>(
	paths: Array<string | number | symbol> | Array<Array<string | number | symbol>>,
	obj: T,
): T {
	const toReturn = clone(obj);

	const newPaths = (Array.isArray(paths[0]) ? paths : [paths]) as Array<
		Array<string | number | symbol>
	>;

	for (const path of newPaths) {
		removeImpure(path, toReturn);
	}
	return toReturn;
}

// export function exclude<T extends object>(paths: Array<string | number | symbol>, obj: T): T {
//     return obj
// }
