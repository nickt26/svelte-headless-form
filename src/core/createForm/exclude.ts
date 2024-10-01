import { clone } from '../../internal/util/clone';
import { removePropertyI } from '../../internal/util/removeProperty';

// TODO: figure out how to mix and match dot path arrays and a path made up of an array
export function exclude<T extends object>(
	paths: Array<PropertyKey> | Array<Array<PropertyKey>>,
	obj: T,
): T {
	const toReturn = clone(obj);

	const newPaths = (Array.isArray(paths[0]) ? paths : [paths]) as Array<Array<PropertyKey>>;

	for (const path of newPaths) {
		//@ts-expect-error will fix
		removePropertyI(path, toReturn);
	}
	return toReturn;
}

// export function exclude<T extends object>(paths: Array<PropertyKey>, obj: T): T {
//     return obj
// }
