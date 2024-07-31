<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import { createForm } from '../../../src/core/createForm';
	import { All, This, PartialValidatorFields, PartialValidatorss, Values } from '../../../src/types/Form';
	import FieldArray from '../components/FieldArray.svelte';
	import Input from '../components/Input.svelte';
	import { roles, type FormValues } from '../types/FormValues';
	import * as yup from 'yup';
	import { onDestroy } from 'svelte';
	import { clone } from '../../../src/internal/util/clone';
	import { isObject } from '../../../src/internal/util/isObject';

	const delay = <T>(fn: () => T, ms?: number): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, ms ?? 3000),
		);

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
		initialValidators,
		validators,
		latestFieldEvent,
		validate,
		updateValue,
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
		initialValidators: (initialValues) => ({
			username: (value) => !value.length && 'Username is required',
			password: (value) => !value.length && 'Password is required',
			nested: {
				[This]: (val) => !val && 'Nested is required',
				age: (val) => (val === null && 'Age is required') || (val <= 0 && 'Age must be greater than 0'),
				gender: (val) => !val && 'Gender must be true',
			},
			roles: {
				[This]: (val) => val.length === 0 && 'Roles are required',
				[All]: (val) => !roles.includes(val) && 'Role is invalid',
				[Values]: initialValues.roles.map((_) => (val) => !roles.includes(val) && 'Role is invalid'),
			},
			// testers: 			rolesAreUnique: (_, { values, errors }) => {
			// 	const allRolesAreNotUnique = values.roles.some((role, i) =>
			// 		values.roles.some((_role, j) => _role === role && i !== j),
			// 	);
			// 	const allRolesHaveNoErrors = !errors.roles.some((error) => error === false);
			// 	return allRolesAreNotUnique && allRolesHaveNoErrors && 'Roles must be unique';
			// },
		}),
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

	const disallowConcurrency = (fn: (val: any) => Promise<any>) => {
		let inprogressPromise = Promise.resolve();

		return (arg: any) => {
			const val = clone(arg);
			inprogressPromise = inprogressPromise.then(() => fn(val));

			return inprogressPromise;
		};
	};

	// const rolesArray = useFieldArray('roles');
	// rolesArray.append('omega', {
	// 	validate: true,
	// });

	// $values.roles. = [...$values.roles]

	// updateValue('nested', $values.nested, {
	// 	validate: false,
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
		<button type="button" on:click={() => resetField('username', { value: 'banana', validator: () => false })}
			>Reset Username</button
		>
	{/if}
	<!-- <Input {control} name="password" type="password" /> -->
	<Input {control} name="nested.age" type="number" />
	<!-- <input type="number" bind:value={$values.nested.age} on:blur={() => handleBlur('nested.age')} />
	{#if $errors?.nested?.age}
		<div style="color:red;">{$errors.nested.age}</div>
	{/if} -->

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

	{#if $errors.nested && 'gender' in $errors.nested && $errors?.nested?.gender}
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
	<button type="button" on:click={() => resetForm({ values: initialValues, validators: initialValidators })}>
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
