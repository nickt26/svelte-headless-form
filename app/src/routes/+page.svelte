<script lang="ts">
	import { createForm } from '../../../src/core/createForm';

	const delay = <T>(fn: () => T): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, 3000)
		);

	const initialValues = {
		username: '',
		password: ''
	};
	const {
		submitForm,
		touched,
		input,
		errors,
		values,
		state,
		dirty,
		pristine,
		resetForm,
		resetField
	} = createForm({
		initialDeps: {
			username: ['password']
		},
		initialValues,
		initialValidators: {
			username: async (value) =>
				await delay(() => (value.length > 0 ? false : 'Username is required')),
			password: (value) => (value.length > 0 ? false : 'Password is required')
		}
		// validationResolver: (values) => {
		// 	const errors: any = {};

		// 	if (values.username.length === 0) {
		// 		errors.username = 'Username is required';
		// 	}

		// 	if (values.password.length === 0) {
		// 		errors.password = 'Password is required';
		// 	}
		// 	return errors;
		// }
	});
</script>

<form on:submit|preventDefault={submitForm((values) => delay(() => console.log(values)))}>
	<input
		type="text"
		name="username"
		value={$values.username}
		on:input={input.handleChange}
		on:blur={input.handleBlur}
		on:focus={input.handleFocus}
	/>
	<span>touched: {$touched.username}</span>
	<span>dirty: {$dirty.username}</span>
	<span>pristine: {$pristine.username}</span>
	{#if $errors.username}
		<span>
			{$errors.username}
		</span>
	{/if}
	<button type="button" on:click={() => resetField('username')}>Reset Username</button>

	<input
		type="password"
		name="password"
		value={$values.password}
		on:input={input.handleChange}
		on:blur={input.handleBlur}
		on:focus={input.handleFocus}
	/>
	{#if $errors.password}
		<span>
			{$errors.password}
		</span>
	{/if}

	<button type="submit" disabled={$state.isSubmitting || $state.isValidating}>Submit</button>
	<button type="button" on:click={() => resetForm({ username: '123' })}>Reset</button>

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
