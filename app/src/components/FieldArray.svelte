<script lang="ts">
	import type { FormValues, Roles } from '../types/FormValues';

	import { useFieldArray } from '../../../src/core/useFieldArray';
	import type { FormControl } from '../../../src/types/Form';
	import Input from './Input.svelte';

	export let control: FormControl<FormValues>;
	export let name: string;
	const {
		fields,
		remove,
		form: { touched, dirty, pristine },
	} = useFieldArray<Roles, FormValues>({ name, control });
</script>

<div>
	{#each $fields as _, index}
		<Input {control} name={`${name}.${index}`} />
		<button type="button" on:click={() => remove(index)}>Remove</button>
		<div>touched: {$touched.roles[index]}</div>
		<div>dirty: {$dirty.roles[index]}</div>
		<div>pristine: {$pristine.roles[index]}</div>
	{/each}
</div>
