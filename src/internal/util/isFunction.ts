export const isFunction = (value: unknown): value is Function => {
	return typeof value === 'function';
};
