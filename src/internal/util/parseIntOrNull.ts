export const parseIntOrNull = (val: string): number | null => {
	const parsed = parseInt(val);
	return isNaN(parsed) ? null : parsed;
};
