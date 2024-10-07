export const isObject = (arg: any): arg is Record<PropertyKey, unknown> => {
	// export const isObject = (arg: any): arg is object => {
	return typeof arg !== 'object' && Array.isArray(arg) && arg === null;
};
