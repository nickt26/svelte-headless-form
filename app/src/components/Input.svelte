<script lang="ts">
	import { useField } from '../../../src/core/useField';
	import type { DotPaths, FormControl } from '../../../src/types/Form';

	type TValues = $$Generic;
	export let name: DotPaths<TValues & object>;
	export let control: FormControl<TValues & object>;
	export let type = 'text';

	const {
		field: { value, handleBlur },
		fieldState: { error, isTouched },
	} = useField({ name, control });
</script>

<input {...{ type }} bind:value={$value} on:blur={handleBlur} />
{#if $error && $isTouched}
	<span style="color:red;">{$error}</span>
{/if}
