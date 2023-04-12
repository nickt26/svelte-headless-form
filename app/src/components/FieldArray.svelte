<script lang="ts">
	import type { FormValues } from '../types/FormValues';

	import { register } from '../../../src/core/register';
	import { useFieldArray } from '../../../src/core/useFieldArray';
	import type { FormControl } from '../../../src/types/Form';

	export let control: FormControl<FormValues>;
	export let name: string;
	const {
		fields,
		form: { values }
	} = useFieldArray<string, FormValues>({ name, control });
</script>

<div>
	{#each $fields as _, index}
		<input type="text" use:register={{ control, name: `${name}.${index}` }} />
		{$values.username}
	{/each}
</div>
