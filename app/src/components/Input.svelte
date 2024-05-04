<script lang="ts">
	import { useField } from '../../../src/core/useField';
	import type { FormControl } from '../../../src/types/Form';

	export let name: string;
	export let control: FormControl;
	export let type = 'text';

	const {
		field: { value, handleBlur },
		fieldState: { error, isTouched },
	} = useField<string | number | null>({ name, control });
</script>

<input {...{ type }} bind:value={$value} on:blur={handleBlur}  />
{#if ($error && $isTouched)}
	<span style="color:red;">{$error}</span>
{/if}
