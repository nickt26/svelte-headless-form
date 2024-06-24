type StringBuilder = {
	__state: Array<ValidationFn>;
	string(errMsg?: string): Omit<StringBuilder, 'string'>;
	len: (len: number, errMsg?: string) => Omit<StringBuilder, 'string' | 'len'>;
	build(): ValidationFn;
};

type ValidationFn = <TGlobalState = unknown>(
	val: string | undefined,
	globalState?: TGlobalState,
) => string | false;

type ValidationFnBuilder<TValidationFnName extends keyof StringBuilder> = (
	state: StringBuilder['__state'],
) => StringBuilder[TValidationFnName];

const buildBuilder: ValidationFnBuilder<'build'> = (state) => {
	return () => {
		return (val, globalState) => {
			for (const fn of state) {
				const res = fn(val, globalState);
				if (res) return res;
			}
			return false;
		};
	};
};

const lengthBuilder: ValidationFnBuilder<'len'> = (state) => {
	return (len, errMsg) => {
		const _state: StringBuilder['__state'] = [
			...state,
			(val) => val?.length !== len && (errMsg ?? `Value must be of length ${len}`),
		];

		return {
			__state: _state,
			build: buildBuilder(_state),
		} satisfies Omit<StringBuilder, 'string' | 'len'>;
	};
};

export const str: StringBuilder['string'] = (errMsg) => {
	const state: StringBuilder['__state'] = [
		(val) => typeof val !== 'string' && (errMsg ?? 'Value must be a string'),
	];

	return {
		__state: state,
		len: lengthBuilder(state),
		build: buildBuilder(state),
	} satisfies Omit<StringBuilder, 'string'>;
};
