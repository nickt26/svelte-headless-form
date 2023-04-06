<script lang="ts">
	import { useField } from 'src/core/useField';
	import type { FormControl } from 'src/internal/types/Form';
	type IncomingForm = $$Generic;
	type IncomingValidators = $$Generic;
	export let control: FormControl<IncomingForm & object, IncomingValidators & object>;
	export let name: string;
	const {
		field: { value },
		form: { values }
	} = useField<string>({ name, control });
</script>

<input type="text" bind:value={$value} on:blur />
