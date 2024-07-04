<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import { createForm } from '../../../src/core/createForm';
	import {
		AllFields,
		CurrentObject,
		PartialValidatorFields,
		PartialValidatorss,
		Values,
	} from '../../../src/types/Form';
	import FieldArray from '../components/FieldArray.svelte';
	import Input from '../components/Input.svelte';
	import { roles, type FormValues } from '../types/FormValues';
	import * as yup from 'yup';
	import { onDestroy } from 'svelte';
	import { clone } from '../../../src/internal/util/clone';

	const delay = <T>(fn: () => T, ms?: number): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, ms ?? 3000),
		);

	type No<T extends object> = {
		[K in keyof T]: () => string | false;
	};
	type Yes<O extends object> = {
		a: <const T extends No<O> = No<O>>(val: any) => T;
	};

	const yes = { a: 3, b: '4' };
	const fn = (ret: { a: number }, unused?: { a: number }): typeof unused => {
		return ret;
	};

	type Fn = (values: { a: number }, unused?: { a: number }) => typeof unused;

	const ffn: Fn = (values) => {
		return {
			a: 3,
			b: '4',
		};
	};

	const {
		submitForm,
		errors,
		values,
		state,
		resetForm,
		resetField,
		control,
		touched,
		handleBlur,
		initialValues,
		initialDeps,
		initialValidators,
		validators,
		latestFieldEvent,
		validate,
		updateValue,
		deps,
		useFieldArray,
	} = createForm<FormValues>({
		initialValues: {
			username: 'Banana',
			password: 'password',
			nested: {
				age: 0,
				gender: false,
			},
			roles: ['admin', 'user', 'guest'],
			rolesAreUnique: null,
			files: null,
			testers: [],
		},
		initialValidators: (val) => ({
			username: (value) => !value.length && 'Username is required',
			password: (value) => !value.length && 'Password is required',
			nested: {
				// [CurrentObject]: (val) => !val && 'Nested is required',
				age: (val) => (val === null && 'Age is required') || (val <= 0 && 'Age must be greater than 0'),
				gender: (val) => !val && 'Gender must be true',
			},
			// roles: [
			// 	{
			// 		current: (val) => !val.length && 'Roles are required',
			// 		all: (val) => !roles.includes(val) && 'Role is invalid',
			// 	},
			// 	[(val) => !roles.includes(val) && 'Role is invalid'],
			// ],
			testers: {
				[CurrentObject]: (val) => val.length === 0 && 'Roles are required',
				[AllFields]: (val) => !roles.includes(val) && 'Role is invalid',
				[Values]: initialValues.roles.map((_) => (val) => !roles.includes(val) && 'Role is invalid'),
			},
			rolesAreUnique: (_, { values, errors }) => {
				const allRolesAreNotUnique = values.roles.some((role, i) =>
					values.roles.some((_role, j) => _role === role && i !== j),
				);
				const allRolesHaveNoErrors = !errors.roles.some((error) => error === false);
				return allRolesAreNotUnique && allRolesHaveNoErrors && 'Roles must be unique';
			},
		}),
		initialDeps: {
			rolesAreUnique: ['roles'],
			roles: {
				[AllFields]: ['username'],
				[Values]: [['username']],
			},
		},
		// validationResolver: (values) => {
		// 	const errors = {} as PartialDeep<ObjectDeep<FormValues, string | false>>;

		// 	if (values.username.length === 0) errors.username = 'Username is required';

		// 	if (values.password.length === 0) errors.password = 'Password is required';

		// 	if (isObject(values.nested)) {
		// 		if (values.nested.age <= 0 || values.nested.age === null)
		// 			if (errors.nested === undefined) errors.nested = { age: 'Age must be greater than 0' };
		// 			else if (isObject(errors.nested)) errors.nested.age = 'Age must be greater than 0';

		// 		if (values.nested.gender === false)
		// 			if (errors.nested === undefined) errors.nested = { gender: 'Gender must be true' };
		// 			else if (isObject(errors.nested)) errors.nested.gender = 'Gender must be true';
		// 	}
		// 	return errors;
		// },
	});

	let showUsername = true;

	type MyStore = {
		values: {
			username: string;
			password: string;
		};
		touched: {
			username: boolean;
			password: boolean;
		};
	};

	const myStore = writable<MyStore>({
		values: {
			username: '',
			password: '',
		},
		touched: {
			username: true,
			password: true,
		},
	});

	// const queueConcurrency = (fn: (val: any) => Promise<any>) => {
	// 	const queue = [] as any[];

	// 	const toReturn = async (arg: any) => {
	// 		const val = clone(arg);
	// 		queue.push(() => fn(val));
	// 		await queue[0];
	// 		queue.unshift();
	// 		if (queue.length > 0) {
	// 		}
	// 		inprogressPromise = inprogressPromise.then(() => fn(val));

	// 		return inprogressPromise;
	// 	};
	// };

	const disallowConcurrency = (fn: (val: any) => Promise<any>) => {
		let inprogressPromise = Promise.resolve();

		return (arg: any) => {
			const val = clone(arg);
			inprogressPromise = inprogressPromise.then(() => fn(val));

			return inprogressPromise;
		};
	};

	// const myStoreUnsubFnSync = disallowConcurrency(async (val) => {
	// if (val.username === 'banana') {
	// 	await delay(() => null);
	// } else if (val.username !== '') {
	// 	await delay(() => null, 1000);
	// }
	// 	console.log(val);
	// });

	// const mystoreunsub = mystore.subscribe(async (val) => {
	// 	await mystoreunsubfnsync(val);
	// });

	const myStoreUnsub = myStore.subscribe((val) => {
		console.log(val);
	});

	// myStore.update((vals) => ({
	// 	...vals,
	// 	values: {
	// 		...vals.values,
	// 		username: 'banana',
	// 	},
	// }));

	// myStore.update((vals) => ({
	// 	...vals,
	// 	values: {
	// 		...vals.values,
	// 		username: 'apple',
	// 	},
	// }));

	onDestroy(() => {
		myStoreUnsub();
	});

	// const rolesArray = useFieldArray('roles');
	// rolesArray.append('omega', {
	// 	validate: true,
	// });

	// const reset = () => {
	// 	batch(({ values, clean, updateValue }) => {
	// 		values.update((vals) => ({
	// 			...vals,
	// 			username: 'banana',
	// 		}));

	// 		clean('username');
	// 		updateValue('username', $values.username, {
	// 			validate: false,
	// 		});
	// 	});
	// };

	// $values.roles. = [...$values.roles]

	// updateValue('nested', $values.nested, {
	// 	validate: false,
	// 	newDeps: ['nested.*.3'],
	// 	newValidator: (val) => Object.keys(val).length <= 0 && 'Nested is required',
	// });

	$: jsonstring = JSON.stringify($values);
	$: errString = JSON.stringify($errors);
</script>

<form
	on:submit={submitForm(
		(values) => delay(() => console.log(values)),
		(errors) => console.log(errors),
	)}
>
	<div>{jsonstring}</div>
	<div>{errString}</div>
	<input type="file" bind:value={$values.files} />
	{#if $values.files}
		{#each $values.files as file}
			<div>
				{file.name}
			</div>
		{/each}
	{/if}
	<button type="button" on:click={() => (showUsername = !showUsername)}>Toggle Username</button>
	{#if showUsername}
		<input type="text" bind:value={$values.username} on:blur={() => handleBlur('username')} />
		<div>Touched username:{$touched.username}</div>
		<button type="button" on:click={() => resetField('username', { value: 'banana', deps: [], validator: () => false })}
			>Reset Username</button
		>
	{/if}
	<!-- <Input {control} name="password" type="password" /> -->
	<Input {control} name="nested.age" type="number" />
	<!-- <input type="number" bind:value={$values.nested.age} on:blur={() => handleBlur('nested.age')} />
	{#if $errors?.nested?.age}
		<div style="color:red;">{$errors.nested.age}</div>
	{/if} -->

	<input type="text" bind:value={$myStore.values.username} />
	<!-- <input type="checkbox" bind:checked={$values.nested.gender} /> -->
	<button
		type="button"
		on:click={() =>
			'gender' in $values.nested && $values.nested.gender
				? ($values.nested = { gender: false, age: 15 })
				: ($values.nested = { gender: true, age: 10 })}
		on:blur={() => handleBlur('nested.gender')}>Change Gender</button
	>
	<div>Gender: {'gender' in $values.nested ? $values.nested.gender : 'No gender selected'}</div>

	{#if 'gender' in $errors.nested && $errors?.nested?.gender}
		<div style="color:red">
			{$errors.nested.gender}
		</div>
	{/if}

	<FieldArray name="roles" {control} />
	<!-- {#each $values.roles as role, i}
		<input type="text" bind:value={role} />
		{#if $errors?.roles?.[i]}
			<div style="color:red">
				{$errors.roles[i]}
			</div>
		{/if}
	{/each} -->
	<button type="button" on:click={() => resetField('roles')}>Reset Roles</button>
	{#if $errors.rolesAreUnique}
		<div style="color:red;">{$errors.rolesAreUnique}</div>
	{/if}

	<button type="submit">Submit</button>
	<button
		type="button"
		on:click={() => resetForm({ values: initialValues, validators: initialValidators, deps: initialDeps })}
	>
		Reset</button
	>

	<div>
		isValidating: {$state.isValidating ? 'Yes' : 'No'}
	</div>
	<div>
		isSubmitting: {$state.isSubmitting ? 'Yes' : 'No'}
	</div>
	<div>
		isTouched: {$state.isTouched ? 'Yes' : 'No'}
	</div>
	<div>
		isDirty: {$state.isDirty ? 'Yes' : 'No'}
	</div>
	<div>
		isPristine: {!$state.isDirty ? 'Yes' : 'No'}
	</div>
	<div>
		hasErrors: {$state.hasErrors ? 'Yes' : 'No'}
	</div>
</form>
