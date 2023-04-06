export const isObject = <T extends object | unknown = null>(
	val: unknown
): val is T extends null ? Record<string | number | symbol, unknown> : T => {
	return typeof val === 'object' && !Array.isArray(val) && val !== null && !(val instanceof Date);
};
