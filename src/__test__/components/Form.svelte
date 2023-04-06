<script lang="ts">
	import { createForm } from 'src/core/createForm';
	import Input from './Input.svelte';

	const { submitForm, control } = createForm({
		initialValues: { name: '', email: '' },
		initialValidators: { name: (val) => false, email: (val) => false }
	});
</script>

<form on:submit|preventDefault={() => submitForm((values) => console.log(values))}>
	<Input {control} name="name" />
</form>
