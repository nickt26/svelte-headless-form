export const isObject = (arg: any): arg is Record<string | number | symbol, unknown> => {
	// export const isObject = (arg: any): arg is object => {
	if (
		typeof arg !== 'object' ||
		Array.isArray(arg) ||
		arg === null
		// (Date !== undefined && arg instanceof Date) ||
		// (File !== undefined && arg instanceof File) ||
		// (FileList !== undefined && arg instanceof FileList)
	)
		return false;
	return true;
};
