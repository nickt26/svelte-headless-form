export const isArray = <T>(val: T): val is Record<string | number | symbol, unknown> & T => {
	return Array.isArray(val);
};
