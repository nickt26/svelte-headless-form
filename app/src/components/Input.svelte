<script lang="ts">
	import { useField } from '../../../src/core/useField';
	import type { FormControl } from '../../../src/types/Form';

	type IncomingFormValues = $$Generic;

	export let name: string;
	export let control: FormControl<IncomingFormValues & object>;
	export let type = 'text';
	export let parseToInt = false;

	const {
		field: { value },
		fieldState: { error, isTouched },
		form: { register },
	} = useField<string | number | null, IncomingFormValues & object>({ name, control });
</script>

<input
	{type}
	value={$value}
	on:input={(e) =>
		($value = parseToInt
			? isNaN(parseInt(e.currentTarget.value))
				? null
				: parseInt(e.currentTarget.value)
			: e.currentTarget.value)}
	use:register={{ name }}
/>
{#if $error && $isTouched}
	<span style="color:red;">{$error}</span>
{/if}
