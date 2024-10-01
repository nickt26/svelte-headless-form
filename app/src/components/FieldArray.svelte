<script lang="ts">
	import type { FormValues, Roles } from '../types/FormValues';

	import { useFieldArray } from '../../../src/core/useFieldArray';
	import type { ArrayDotPaths, DotPaths, FormControl } from '../../../src/types/Form';
	import Input from './Input.svelte';

	export let control: FormControl<FormValues>;
	export let name: ArrayDotPaths<FormValues>;
	// export let onInput: () => void = () => {};
	const {
		fields,
		remove,
		form: { touched, dirty },
	} = useFieldArray<Roles, FormValues>({ name, control });
</script>

<div>
	{#each $fields as _, i}
		<Input {control} name={`${name}.${i}`} />
		<button type="button" on:click={() => remove(i)}>Remove</button>
		<div>touched: {$touched.roles[i]}</div>
		<div>dirty: {$dirty.roles[i]}</div>
		<div>pristine: {!$dirty.roles[i]}</div>
	{/each}
</div>
