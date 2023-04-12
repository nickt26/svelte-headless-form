<script lang="ts">
	import { createForm } from '../../core/createForm';
	import Input from './Input.svelte';

	const { submitForm, control } = createForm({
		initialValues: { name: '', email: '' },
		initialValidators: { name: () => false, email: () => false }
	});
</script>

<form on:submit|preventDefault={submitForm((values) => console.log(values))}>
	<Input {control} name="name" />
</form>
