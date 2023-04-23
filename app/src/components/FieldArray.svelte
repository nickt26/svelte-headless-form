<script lang="ts">
	import type { FormValues, Roles } from '../types/FormValues';

	import { useFieldArray } from '../../../src/core/useFieldArray';
	import type { FormControl } from '../../../src/types/Form';
	import Input from './Input.svelte';

	export let control: FormControl<FormValues>;
	export let name: string;
	const { fields } = useFieldArray<Roles, FormValues>({ name, control });
</script>

<div>
	{#each $fields as _, index}
		<Input {control} name={`${name}.${index}`} />
	{/each}
</div>
