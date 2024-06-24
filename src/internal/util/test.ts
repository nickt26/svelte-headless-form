export class UserNotFoundError extends Error {
	constructor() {
		super('User not found');
	}
}

export class ServiceError extends Error {
	constructor() {
		super('Service error');
	}
}

export function tester(val: unknown): string | number | UserNotFoundError | ServiceError {
	if (typeof val === 'string') {
		return val;
	}

	if (typeof val === 'number') {
		return val;
	}

	if (typeof val === 'boolean') {
		return new UserNotFoundError();
	}

	return new ServiceError();
}
