<script lang="ts" generics="T extends object">
	import { useField } from '../../../src/core/useField';
	import type { DotPaths, FormControl } from '../../../src/types/Form';

	export let name: DotPaths<T>;
	export let control: FormControl<T>;
	export let type = 'text';

	const {
		field: { value, onBlur, onFocus },
		fieldState: { error, isTouched },
	} = useField({ name, control });
</script>

<input {...{ type }} bind:value={$value} on:blur={onBlur} on:focus={onFocus} />
{#if $error && $isTouched}
	<span style="color:red;">{$error}</span>
{/if}
