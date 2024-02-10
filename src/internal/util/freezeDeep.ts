import { ReadonlyDeep } from './../../types/Form';
export const freezeDeep = <T extends object>(obj: T): ReadonlyDeep<T> => {
	Object.values(obj).forEach((val) => Object.isFrozen(val) || freezeDeep(val));
	return Object.freeze(obj) as ReadonlyDeep<T>;
};
