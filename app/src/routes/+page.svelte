<script lang="ts">
	import { createForm } from '../../../src/core/createForm';
	import { roles, type FormValues } from '../types/FormValues';

	const delay = <T>(fn: () => T): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, 3000),
		);

	// const banana: TriggerFields<FormValues> = {
	// 	username: ['username'],
	// 	password: ['password'],
	// 	nested: {
	// 		triggers: ['nested'],
	// 	},
	// 	roles: {
	// 		triggers: ['roles'],
	// 		values: [['roles.0']],
	// 	},
	// 	rolesAreUnique: ['roles'],
	// };

	const {
		submitForm,
		errors,
		values,
		state,
		resetForm,
		resetField,
		control,
		register,
		touched,
		handleChange,
		handleBlur,
		initialValues,
		initialDeps,
		initialValidators,
		validators,
		latestFieldEvent,
		validate,
		updateValue,
		deps,
		useFieldArray
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
		},
		initialValidators: (initialValues) => ({
			username: (value) => (value.length > 0 ? false : 'Username is required'),
			password: (value) => (value.length > 0 ? false : 'Password is required'),
			nested: {
				age: (val) => (val === null ? 'Age is required' : val <= 0 ? 'Age must be greater than 0' : false),
				gender: (val) => (val === false ? 'Gender must be true' : false),
			},
			roles: initialValues.roles.map((_) => (val) => !roles.includes(val) ? 'Role is invalid' : false),
			rolesAreUnique: (_, { values, errors }) => {
				const allRolesAreNotUnique = values.roles.some((role, i) =>
					values.roles.some((_role, j) => _role === role && i !== j),
				);
				const allRolesHaveNoErrors = !errors.roles.some((error) => error === false);
				return allRolesAreNotUnique && allRolesHaveNoErrors ? 'Roles must be unique' : false;
			},
		}),
		initialDeps: {
			rolesAreUnique: ['roles'],
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

	const rolesArray = useFieldArray('roles');
	rolesArray.append('omega', {
		validate: true,
	});

	$: jsonstring = JSON.stringify($values);
</script>

<form
	on:submit={submitForm(
		(values) => delay(() => console.log(values)),
		(errors) => console.log(errors),
	)}
>
	{jsonstring}
	<input type="file" use:register={{ name: 'files' }} />
	{#if $values.files}
		{#each $values.files as file}
			<div>
				{file.name}
			</div>
		{/each}
	{/if}
	<button type="button" on:click={() => (showUsername = !showUsername)}>Toggle Username</button>
	{#if showUsername}
		<input type="text" bind:value={$values.username} />
		<button type="button" on:click={() => resetField('username', { value: 'banana', deps: [], validator: () => false })}
			>Reset Username</button
		>
	{/if}
	<!-- <Input {control} name="password" type="password" />
	<Input {control} name="nested.age" type="number" /> -->
	<input type="number" bind:value={$values.nested.age} on:blur={() => handleBlur('nested.age')} />

	<input type="checkbox" bind:checked={$values.nested.gender} />
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

	<!-- <FieldArray name="roles" {control} /> -->
	{#each $values.roles as role, i}
		<input type="text" bind:value={role} />
		{#if $errors?.roles?.[i]}
			<div style="color:red">
				{$errors.roles[i]}
			</div>
		{/if}
	{/each}
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
