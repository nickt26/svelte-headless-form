export const isDate = (val: unknown): val is Date => {
	return val instanceof Date;
};
