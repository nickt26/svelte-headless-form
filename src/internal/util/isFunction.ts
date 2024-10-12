import { Fn } from '../../types/Form';

export const isFunction = (value: unknown): value is Fn => {
	return typeof value === 'function';
};
