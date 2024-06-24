export function ignoreErrors<T>(value: T): Exclude<T, Error> | undefined {
	return value instanceof Error ? undefined : (value as Exclude<T, Error>);
}
