<script>
	import { createForm } from '../../../src/core/createForm';
	const { submitForm, input, errors, values } = createForm({
		validateMode: 'onBlur',
		initialValues: {
			username: '',
			password: ''
		},
		initialValidators: {
			username: (value) => (value.length > 0 ? false : 'Name is required'),
			password: (value) => (value.length > 0 ? false : 'Password is required')
		}
	});
</script>

<form on:submit|preventDefault={() => submitForm((values) => console.log(values))}>
	<input
		type="text"
		name="username"
		value={$values.username}
		on:input={input.handleChange}
		on:blur={input.handleBlur}
		on:focus={input.handleFocus}
	/>
	{#if $errors.username}
		<div>
			{$errors.username}
		</div>
	{/if}

	<input
		type="password"
		name="password"
		value={$values.password}
		on:input={input.handleChange}
		on:blur={input.handleBlur}
		on:focus={input.handleFocus}
	/>
	{#if $errors.password}
		<div>
			{$errors.password}
		</div>
	{/if}

	<button type="submit">Submit</button>
</form>
