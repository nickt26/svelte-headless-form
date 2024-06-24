<script lang="ts">
	import { createForm } from '../../core/createForm';
	import { formValidators, formValues } from '../core/createFormUtils';

	const form = createForm({
		initialValues: formValues,
		initialValidators: formValidators,
	});
	const { submitForm, values, errors, touched, dirty, state, handleBlur } = form;
</script>

<form on:submit={submitForm((values) => console.log(values))}>
	<input
		name="name"
		data-testid="name-input"
		type="text"
		bind:value={$values.name}
		on:blur={() => handleBlur('name')} />
	<div data-testid="name-touched">{$touched.name}</div>
	<div data-testid="name-dirty">{$dirty.name}</div>
	{#if $errors.name}
		<div data-testid="name-error">{$errors.name}</div>
	{/if}

	<input
		name="email"
		data-testid="email-input"
		type="text"
		bind:value={$values.email}
		on:blur={() => handleBlur('email')} />
	<div data-testid="email-touched">{$touched.email}</div>
	<div data-testid="email-dirty">{$dirty.email}</div>
	{#if $errors.email}
		<div data-testid="email-error">{$errors.email}</div>
	{/if}

	<button data-testid="submit-button" type="submit">Submit</button>
</form>
