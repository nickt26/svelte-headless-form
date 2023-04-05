//Safe to turn off eslint here since the intent is to mimic how TS would infer the type of typeof obj === 'function'
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (obj: unknown): obj is Function => {
	return typeof obj === 'function';
};
