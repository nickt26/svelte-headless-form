<script lang="ts">
	import { createForm } from '../../../src/core/createForm';
	import { register } from '../../../src/core/register';
	import FieldArray from '../components/FieldArray.svelte';

	const delay = <T>(fn: () => T): Promise<T> =>
		new Promise((resolve) =>
			setTimeout(() => {
				resolve(fn());
			}, 3000)
		);

	const initialValues = {
		username: '',
		password: '',
		nested: {
			age: 0,
			gender: false
		},
		roles: ['admin', 'user', 'guest']
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
		resetField,
		control,
		validators
	} = createForm({
		initialValues,
		initialValidators: {
			username: (value) => (value.length > 0 ? false : 'Username is required'),
			password: (value) => (value.length > 0 ? false : 'Password is required')
		},
		initialDeps: {
			username: ['nested']
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
	$validators.nested.age = (value) =>
		value <= 0 || value === null ? 'Age must be greater than 0' : false;
	// setTimeout(() => {
	// 	console.log('runs this');

	// 	$validators.username = (value) =>
	// 		value.length >= 3 ? false : 'Username must be at least 3 characters';
	// 	$values.username = '123455';
	// }, 2000);
</script>

<form
	on:submit|preventDefault={submitForm(
		(values) => delay(() => console.log(values)),
		(errors) => console.log(errors)
	)}
>
	<input type="text" use:register={{ control, name: 'username' }} />
	{#if $errors.username}
		<span>
			{$errors.username}
		</span>
	{/if}
	<button type="button" on:click={() => resetField('username')}>Reset Username</button>

	<input type="number" use:register={{ name: 'password', control }} />
	{#if $errors.password}
		<span>
			{$errors.password}
		</span>
	{/if}

	<input
		type="number"
		use:register={{
			name: 'nested.age',
			control,
			parseFn: (value) => (isNaN(parseInt(value)) ? null : parseInt(value))
		}}
	/>
	{#if $errors.nested.age}
		<span>
			{$errors.nested.age}
		</span>
	{/if}

	<FieldArray name="roles" {control} />

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
