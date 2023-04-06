export const isNil = (val: unknown): val is null | undefined => {
	return val === null || val === undefined;
};
