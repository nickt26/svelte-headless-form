export const canParseToInt = (val: any): boolean => {
	try {
		return !isNaN(parseInt(val));
	} catch (e) {
		return false;
	}
};
