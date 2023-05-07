<script lang="ts">
	import { createForm } from '../../../src/core/createForm';
	import FieldArray from '../components/FieldArray.svelte';
	import Input from '../components/Input.svelte';
	import { roles, type FormValues } from '../types/FormValues';

	const delay = <T>(fn: () => T): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, 3000),
		);

	const initialValues: FormValues = {
		username: '',
		password: 'password',
		nested: {
			age: 0,
			gender: false,
		},
		roles: ['admin', 'user', 'guest'],
		rolesAreUnique: null,
	};

	const { submitForm, errors, values, state, resetForm, resetField, control, register, touched } =
		createForm<FormValues>({
			initialValues,
			initialValidators: {
				username: (value) => delay(() => (value.length > 0 ? false : 'Username is required')),
				password: (value) => (value.length > 0 ? false : 'Password is required'),
				nested: {
					age: (val) => (val === null ? 'Age is required' : val <= 0 ? 'Age must be greater than 0' : false),
					gender: (val) => (val === false ? 'Gender must be true' : false),
				},
				roles: initialValues.roles.map((_) => (val) => !roles.includes(val) ? 'Role is invalid' : false),
				rolesAreUnique: (_, { values, errors }) => {
					return values.roles.some((role, i) => values.roles.some((_role, j) => _role === role && i !== j)) &&
						errors.roles.every((error) => error === false)
						? 'Roles must be unique'
						: false;
				},
			},
			initialDeps: {
				username: ['nested'],
				password: ['username'],
				rolesAreUnique: ['roles'],
			},
			// validationResolver: (values) => {
			// 	const errors: PartialErrorFields<typeof initialValues> = {};

			// 	if (values.username.length === 0) errors.username = 'Username is required';

			// 	if (values.password.length === 0) errors.password = 'Password is required';

			// 	if (values.nested.age <= 0 || values.nested.age === null)
			// 		errors.nested === undefined
			// 			? (errors.nested = { age: 'Age must be greater than 0' })
			// 			: (errors.nested.age = 'Age must be greater than 0');

			// 	if (values.nested.gender === false)
			// 		errors.nested === undefined
			// 			? (errors.nested = { gender: 'Gender must be true' })
			// 			: (errors.nested.gender = 'Gender must be true');
			// 	return errors;
			// }
		});

	let showUsername = true;
	$: {
		console.log('touched', $touched);
	}
</script>

<form
	on:submit|preventDefault={submitForm(
		(values) => delay(() => console.log(values)),
		(errors) => console.log(errors),
	)}
>
	<button type="button" on:click={() => (showUsername = !showUsername)}>Toggle Username</button>
	{#if showUsername}
		<Input {control} name="username" />
		<button type="button" on:click={() => resetField('username')}>Reset Username</button>
	{/if}

	<Input {control} name="password" type="password" />
	<Input {control} name="nested.age" type="number" parseToInt />

	<button
		type="button"
		on:click={() => ($values.nested.gender = !$values.nested.gender)}
		use:register={{ name: 'nested.gender', changeEvent: 'click' }}>Change Gender</button
	>
	<div>Gender: {$values.nested.gender}</div>
	{#if $errors.nested.gender}
		<div>
			{$errors.nested.gender}
		</div>
	{/if}

	<FieldArray name="roles" {control} />
	<button type="button" on:click={() => resetField('roles')}>Reset Roles</button>
	{#if $errors.rolesAreUnique}
		<div>{$errors.rolesAreUnique}</div>
	{/if}

	<button type="submit">Submit</button>
	<button
		type="button"
		on:click={() =>
			resetForm(
				{
					username: 'banana',
					nested: { age: 10 },
					roles: ['baker'],
				},
				{ replaceArrays: false },
			)}>Reset</button
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
		isPristine: {$state.isPristine ? 'Yes' : 'No'}
	</div>
</form>
