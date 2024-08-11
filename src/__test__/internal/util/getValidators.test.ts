import { describe, expect, it } from 'vitest';
import { getValidatorss } from '../../../internal/util/getValidators';
import { All, PartialValidatorFields, This, Values } from '../../../types/Form';

describe('primitive', () => {
	it('should get validators', () => {
		const values = {
			firstName: '',
		};
		const validators = {
			firstName: (val) => !val.length && 'First name is required',
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('firstName', validators, values);

		expect(res).toEqual([[['firstName'], validators.firstName]]);
	});

	it('should get nested validators in object', () => {
		const values = {
			location: {
				streetName: '',
			},
		};
		const validators = {
			location: {
				streetName: (val) => !val.length && 'Street name is required',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.streetName', validators, values);

		expect(res).toEqual([[['location', 'streetName'], validators.location.streetName]]);
	});

	it('should get nested validators in array', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: [(val) => !val.length && 'Role is required'],
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles.0', validators, values);

		expect(res).toEqual([[['roles', '0'], validators.roles[0]]]);
	});
});

describe('array', () => {
	it('should get validators', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: [(val) => !val.length && 'Role is required'],
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([[['roles', '0'], validators.roles[0]]]);
	});

	it('should get validators with { [This] }', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: {
				[This]: () => 'error',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([[['roles'], validators.roles[This]]]);
	});

	it('should get validators with { [All] }', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: {
				[All]: (val) => !val.length && 'error',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([[['roles', '0'], validators.roles[All]]]);
	});

	it('should get validators with { [Values] }', () => {
		const values = {
			roles: ['admin', 'user'],
		};
		const validators = {
			roles: {
				[Values]: [(val) => !val.length && 'error', (val) => !val.length && 'error'],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([
			...values.roles.map((_, i) => [['roles', `${i}`], validators.roles[Values][i]]),
		]);
	});

	it('should get validators with { [This], [All] }', () => {
		const values = {
			roles: ['admin', 'user'],
		};
		const validators = {
			roles: {
				[This]: (val) => !val.length && 'test error',
				[All]: (val) => !val.length && 'error',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([
			[['roles'], validators.roles[This]],
			...values.roles.map((_, i) => [['roles', `${i}`], validators.roles[All]]),
		]);
	});

	it('should get validators with { [This], [Values] }', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: {
				[This]: () => 'error',
				[Values]: [(value) => !value.length && 'Role is required'],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([
			[['roles'], validators.roles[This]],
			[['roles', '0'], validators.roles[Values][0]],
		]);
	});

	it('should get validators with { [All], [Values] }', () => {
		const values = {
			roles: ['admin', 'user'],
		};
		const validators = {
			roles: {
				[All]: (val) => !val.length && 'all error',
				[Values]: [(val) => !val.length && 'error', (val) => !val.length && 'error'],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([
			...values.roles.flatMap((_, i) => [
				[['roles', `${i}`], validators.roles[All]],
				[['roles', `${i}`], validators.roles[Values][i]],
			]),
		]);
	});

	it('should get validators with { [This], [All], [Values] }', () => {
		const values = {
			roles: ['admin'],
		};
		const validators = {
			roles: {
				[This]: () => 'error',
				[All]: () => 'test error',
				[Values]: [(value) => !value.length && 'Role is required'],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('roles', validators, values);

		expect(res).toEqual([
			[['roles'], validators.roles[This]],
			[['roles', '0'], validators.roles[All]],
			[['roles', '0'], validators.roles[Values][0]],
		]);
	});
});

describe('object', () => {
	it('should get validators', () => {
		const values = {
			location: {
				streetName: '',
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'Required',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location', validators, values);

		expect(res).toEqual([[['location', 'streetName'], validators.location.streetName]]);
	});

	it('should get validators with { [This] }', () => {
		const values = {
			location: {
				streetName: '',
			},
		};
		const validators = {
			location: {
				[This]: (val) => val.streetName === 'test' && 'Error',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location', validators, values);

		expect(res).toEqual([[['location'], validators.location[This]]]);
	});

	it('should get validators with { [This], [string] }', () => {
		const values = {
			location: {
				streetName: '',
			},
		};
		const validators = {
			location: {
				[This]: (val) => val.streetName === 'test' && 'Error',
				streetName: (value) => !value.length && 'Required',
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location', validators, values);

		expect(res).toEqual([
			[['location'], validators.location[This]],
			[['location', 'streetName'], validators.location.streetName],
		]);
	});

	it('should get validators with { [This], [string], { [This] } }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
				},
			},
		};
		const validators = {
			location: {
				[This]: (val) => val.streetName === 'test' && 'Error',
				streetName: (value) => !value.length && 'Required',
				coords: {
					[This]: (val) => val.lat === 0 && 'Error',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location', validators, values);

		expect(res).toEqual([
			[['location'], validators.location[This]],
			[['location', 'streetName'], validators.location.streetName],
			[['location', 'coords'], validators.location.coords[This]],
		]);
	});

	it('should get validators with { [This], [key: string], { [This], [string] } }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
				},
			},
		};
		const validators = {
			location: {
				[This]: (val) => val.streetName === 'test' && 'Error',
				streetName: (value) => !value.length && 'Required',
				coords: {
					[This]: (val) => val.lat === 0 && 'Error',
					lat: (value) => value === 0 && 'Required',
					lng: (value) => value === 0 && 'Required',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location', validators, values);

		expect(res).toEqual([
			[['location'], validators.location[This]],
			[['location', 'streetName'], validators.location.streetName],
			[['location', 'coords'], validators.location.coords[This]],
			[['location', 'coords', 'lat'], validators.location.coords.lat],
			[['location', 'coords', 'lng'], validators.location.coords.lng],
		]);
	});
});

describe('[object] nested object', () => {
	it('should get validators with { [This] }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
					point: {
						x: 0,
						y: 0,
					},
				},
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'Required',
				coords: {
					[This]: (val) => val.lat === 0 && 'Error',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.coords', validators, values);

		expect(res).toEqual([[['location', 'coords'], validators.location.coords[This]]]);
	});

	it('should get validators with { [This], [string] }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
					point: {
						x: 0,
						y: 0,
					},
				},
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'Required',
				coords: {
					[This]: (val) => val.lat === 0 && 'Error',
					lat: (val) => val === 0 && 'Required',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.coords', validators, values);

		expect(res).toEqual([
			[['location', 'coords'], validators.location.coords[This]],
			[['location', 'coords', 'lat'], validators.location.coords.lat],
		]);
	});

	it('should get validators with { [This], [string], { [This] } }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
					point: {
						x: 0,
						y: 0,
					},
				},
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'error',
				coords: {
					[This]: (val) => val.lat === 0 && 'this error',
					lat: (val) => val === 0 && 'error',
					point: {
						[This]: (val) => val.x === 0 && 'this error',
					},
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.coords', validators, values);

		expect(res).toEqual([
			[['location', 'coords'], validators.location.coords[This]],
			[['location', 'coords', 'lat'], validators.location.coords.lat],
			[['location', 'coords', 'point'], validators.location.coords.point[This]],
		]);
	});

	it('should get validators with { [This], [string], { [string] } }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
					point: {
						x: 0,
						y: 0,
					},
				},
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'error',
				coords: {
					[This]: (val) => val.lat === 0 && 'this error',
					lat: (val) => val === 0 && 'error',
					point: {
						x: (val) => val === 0 && 'error',
					},
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.coords', validators, values);

		expect(res).toEqual([
			[['location', 'coords'], validators.location.coords[This]],
			[['location', 'coords', 'lat'], validators.location.coords.lat],
			[['location', 'coords', 'point', 'x'], validators.location.coords.point.x],
		]);
	});

	it('should get validators with { [This], [string], { [This], [string] } }', () => {
		const values = {
			location: {
				streetName: '',
				coords: {
					lat: 0,
					lng: 0,
					point: {
						x: 0,
						y: 0,
					},
				},
			},
		};
		const validators = {
			location: {
				streetName: (value) => !value.length && 'error',
				coords: {
					[This]: (val) => val.lat === 0 && 'this error',
					lat: (val) => val === 0 && 'error',
					point: {
						[This]: (val) => val.x === 0 && 'this error',
						x: (val) => val === 0 && 'error',
					},
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('location.coords', validators, values);

		expect(res).toEqual([
			[['location', 'coords'], validators.location.coords[This]],
			[['location', 'coords', 'lat'], validators.location.coords.lat],
			[['location', 'coords', 'point'], validators.location.coords.point[This]],
			[['location', 'coords', 'point', 'x'], validators.location.coords.point.x],
		]);
	});

	describe('with parent', () => {
		it('should get validators with { [This] } & parent { [This] }', () => {
			const values = {
				location: {
					streetName: '',
					coords: {
						lat: 0,
						lng: 0,
					},
				},
			};
			const validators = {
				location: {
					[This]: (val) => val.streetName === 'test' && 'Error',
					streetName: (value) => !value.length && 'Required',
					coords: {
						[This]: (val) => val.lat === 0 && 'Error',
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('location.coords', validators, values);
			expect(res).toEqual([
				[['location'], validators.location[This]],
				[['location', 'coords'], validators.location.coords[This]],
			]);
		});

		it('should get validators with { [This], [string] } & parent { [This] }', () => {
			const values = {
				location: {
					streetName: '',
					coords: {
						lat: 0,
						lng: 0,
					},
				},
			};
			const validators = {
				location: {
					[This]: (val) => val.streetName === 'test' && 'Error',
					streetName: (val) => !val.length && 'Required',
					coords: {
						[This]: (val) => val.lat === 0 && 'Error',
						lat: (val) => val === 0 && 'Required',
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('location.coords', validators, values);
			expect(res).toEqual([
				[['location'], validators.location[This]],
				[['location', 'coords'], validators.location.coords[This]],
				[['location', 'coords', 'lat'], validators.location.coords.lat],
			]);
		});

		it('should get validators with { [This], [string], { [This] } } & parent { [This] }', () => {
			const values = {
				location: {
					streetName: '',
					coords: {
						lat: 0,
						lng: 0,
						point: {
							x: 0,
							y: 0,
						},
					},
				},
			};
			const validators = {
				location: {
					[This]: (val) => val.streetName === 'test' && 'this error',
					streetName: (val) => !val.length && 'error',
					coords: {
						[This]: (val) => val.lat === 0 && 'this error',
						lat: (val) => val === 0 && 'error',
						point: {
							[This]: (val) => val.x === 0 && 'this error',
						},
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('location.coords', validators, values);
			expect(res).toEqual([
				[['location'], validators.location[This]],
				[['location', 'coords'], validators.location.coords[This]],
				[['location', 'coords', 'lat'], validators.location.coords.lat],
				[['location', 'coords', 'point'], validators.location.coords.point[This]],
			]);
		});

		it('should get validators with { [This], [string], { [string] } } & parent { [This] }', () => {
			const values = {
				location: {
					streetName: '',
					coords: {
						lat: 0,
						lng: 0,
						point: {
							x: 0,
							y: 0,
						},
					},
				},
			};
			const validators = {
				location: {
					[This]: (val) => val.streetName === 'test' && 'this error',
					streetName: (val) => !val.length && 'error',
					coords: {
						[This]: (val) => val.lat === 0 && 'this error',
						lat: (val) => val === 0 && 'error',
						point: {
							x: (val) => val === 0 && 'error',
						},
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('location.coords', validators, values);
			expect(res).toEqual([
				[['location'], validators.location[This]],
				[['location', 'coords'], validators.location.coords[This]],
				[['location', 'coords', 'lat'], validators.location.coords.lat],
				[['location', 'coords', 'point', 'x'], validators.location.coords.point.x],
			]);
		});

		it('should get validators with { [This], [string], { [This], [string] } } & parent { [This] }', () => {
			const values = {
				location: {
					streetName: '',
					coords: {
						lat: 0,
						lng: 0,
						point: {
							x: 0,
							y: 0,
						},
					},
				},
			};
			const validators = {
				location: {
					[This]: (val) => val.streetName === 'test' && 'this error',
					streetName: (val) => !val.length && 'error',
					coords: {
						[This]: (val) => val.lat === 0 && 'this error',
						lat: (val) => val === 0 && 'error',
						point: {
							[This]: (val) => val.x === 0 && 'this error',
							x: (val) => val === 0 && 'error',
						},
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('location.coords', validators, values);
			expect(res).toEqual([
				[['location'], validators.location[This]],
				[['location', 'coords'], validators.location.coords[This]],
				[['location', 'coords', 'lat'], validators.location.coords.lat],
				[['location', 'coords', 'point'], validators.location.coords.point[This]],
				[['location', 'coords', 'point', 'x'], validators.location.coords.point.x],
			]);
		});
	});
});

describe('[object] nested array', () => {
	it('should get validators with [number]', () => {
		const values = {
			nested: {
				roles: ['admin'],
			},
		};
		const validators = {
			nested: {
				roles: [(value) => !value.length && 'Role is required'],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([[['nested', 'roles', '0'], validators.nested.roles[0]]]);
	});

	it('should get validators with { [This] }', () => {
		const values = {
			nested: {
				roles: ['admin'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[This]: (val) => val.length === 0 && 'error',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([[['nested', 'roles'], validators.nested.roles[This]]]);
	});

	it('should get validators with { [All] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[All]: (val) => val.length === 0 && 'error',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`],
				validators.nested.roles[All],
			]),
		]);
	});

	it('should get validators with { [Values] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`],
				validators.nested.roles[Values][i],
			]),
		]);
	});

	it('should get validators with { [This], [All] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[This]: (val) => val.length === 0 && 'error',
					[All]: (val) => val.length === 0 && 'error',
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			[['nested', 'roles'], validators.nested.roles[This]],
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`],
				validators.nested.roles[All],
			]),
		]);
	});

	it('should get validators with { [This], [Values] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[This]: (val) => val.length === 0 && 'error',
					[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			[['nested', 'roles'], validators.nested.roles[This]],
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`],
				validators.nested.roles[Values][i],
			]),
		]);
	});

	it('should get validators with { [All], [Values] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[All]: (val) => val.length === 0 && 'test error',
					[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.flatMap((_, i) => [
				[['nested', 'roles', `${i}`], validators.nested.roles[All]],
				[['nested', 'roles', `${i}`], validators.nested.roles[Values][i]],
			]),
		]);
	});

	it('should get validators with { [This], [All], [Values] }', () => {
		const values = {
			nested: {
				roles: ['admin', 'user'],
			},
		};
		const validators = {
			nested: {
				roles: {
					[This]: (val) => val.length === 0 && 'this error',
					[All]: (val) => val.length === 0 && 'all error',
					[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			[['nested', 'roles'], validators.nested.roles[This]],
			...values.nested.roles.flatMap((_, i) => [
				[['nested', 'roles', `${i}`], validators.nested.roles[All]],
				[['nested', 'roles', `${i}`], validators.nested.roles[Values][i]],
			]),
		]);
	});

	it('should get validators with [{ [string] }]', () => {
		const values = {
			nested: {
				roles: [
					{
						value: 'admin',
					},
					{
						value: 'user',
					},
				],
			},
		};
		const validators = {
			nested: {
				roles: [
					{
						value: (val) => !val.length && 'Role is required',
					},
					{
						value: (val) => !val.length && 'Role is required',
					},
				],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`, 'value'],
				validators.nested.roles[i].value,
			]),
		]);
	});

	it('should get validators with [{ [This] }]', () => {
		const values = {
			nested: {
				roles: [
					{
						value: 'admin',
					},
					{
						value: 'user',
					},
				],
			},
		};
		const validators = {
			nested: {
				roles: [
					{
						[This]: (val) => !val.value.length && 'this error',
					},
					{
						[This]: (val) => !val.value.length && 'this error',
					},
				],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`],
				validators.nested.roles[i][This],
			]),
		]);
	});

	it('should get validators with [{ [This], [string] }]', () => {
		const values = {
			nested: {
				roles: [
					{
						value: 'admin',
					},
					{
						value: 'user',
					},
				],
			},
		};
		const validators = {
			nested: {
				roles: [
					{
						[This]: (val) => !val.value.length && 'this error',
						value: (val) => !val.length && 'error',
					},
					{
						[This]: (val) => !val.value.length && 'this error',
						value: (val) => !val.length && 'error',
					},
				],
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			...values.nested.roles.flatMap((_, i) => [
				[['nested', 'roles', `${i}`], validators.nested.roles[i][This]],
				[['nested', 'roles', `${i}`, 'value'], validators.nested.roles[i].value],
			]),
		]);
	});

	it('should get validators with { [This], [Values]: [{ [string] }]] }', () => {
		const values = {
			nested: {
				roles: [
					{
						value: 'admin',
					},
					{
						value: 'user',
					},
				],
			},
		};
		const validators = {
			nested: {
				roles: {
					[This]: (val) => val.length === 0 && 'this error',
					[Values]: [
						{
							value: (val) => !val.length && 'error',
						},
						{
							value: (val) => !val.length && 'error',
						},
					],
				},
			},
		} satisfies PartialValidatorFields<typeof values>;

		const res = getValidatorss('nested.roles', validators, values);

		expect(res).toEqual([
			[['nested', 'roles'], validators.nested.roles[This]],
			...values.nested.roles.map((_, i) => [
				['nested', 'roles', `${i}`, 'value'],
				validators.nested.roles[Values][i].value,
			]),
		]);
	});

	describe('with parent', () => {
		it('should get validators with parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: [(val) => !val.length && 'error'],
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				[['nested', 'roles', '0'], validators.nested.roles[0]],
			]);
		});

		it('should get validators with { [This] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[This]: (val) => val.length === 0 && 'error',
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				[['nested', 'roles'], validators.nested.roles[This]],
			]);
		});

		it('should get validators with { [All] } with parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[All]: (val) => val.length === 0 && 'error',
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				...values.nested.roles.map((_, i) => [
					['nested', 'roles', `${i}`],
					validators.nested.roles[All],
				]),
			]);
		});

		it('should get validators with { [Values] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				...values.nested.roles.map((_, i) => [
					['nested', 'roles', `${i}`],
					validators.nested.roles[Values][i],
				]),
			]);
		});

		it('should get validators with { [This], [All] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[This]: (val) => val.length === 0 && 'error',
						[All]: (val) => val.length === 0 && 'error',
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				[['nested', 'roles'], validators.nested.roles[This]],
				...values.nested.roles.map((_, i) => [
					['nested', 'roles', `${i}`],
					validators.nested.roles[All],
				]),
			]);
		});

		it('should get validators with { [This], [Values] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[This]: (val) => val.length === 0 && 'error',
						[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				[['nested', 'roles'], validators.nested.roles[This]],
				...values.nested.roles.map((_, i) => [
					['nested', 'roles', `${i}`],
					validators.nested.roles[Values][i],
				]),
			]);
		});

		it('should get validators with { [All], [Values] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[All]: (val) => val.length === 0 && 'all error',
						[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				...values.nested.roles.flatMap((_, i) => [
					[['nested', 'roles', `${i}`], validators.nested.roles[All]],
					[['nested', 'roles', `${i}`], validators.nested.roles[Values][i]],
				]),
			]);
		});

		it('should get validators with { [This], [All], [Values] } & parent { [This] }', () => {
			const values = {
				nested: {
					roles: ['admin', 'user'],
				},
			};
			const validators = {
				nested: {
					[This]: (val) => val.roles.length === 0 && 'this error',
					roles: {
						[This]: (val) => val.length === 0 && 'this error',
						[All]: (val) => val.length === 0 && 'all error',
						[Values]: [(val) => val.length === 0 && 'error', (val) => val.length === 0 && 'error'],
					},
				},
			} satisfies PartialValidatorFields<typeof values>;

			const res = getValidatorss('nested.roles', validators, values);

			expect(res).toEqual([
				[['nested'], validators.nested[This]],
				[['nested', 'roles'], validators.nested.roles[This]],
				...values.nested.roles.flatMap((_, i) => [
					[['nested', 'roles', `${i}`], validators.nested.roles[All]],
					[['nested', 'roles', `${i}`], validators.nested.roles[Values][i]],
				]),
			]);
		});
	});
});
