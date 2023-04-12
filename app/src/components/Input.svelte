<script lang="ts">
	import { useField } from '../../../src/core/useField';
	import type { FormControl } from '../../../src/types/Form';

	type IncomingFormValues = $$Generic;

	export let name: string;
	export let control: FormControl<IncomingFormValues & object>;

	const {
		field: { value }
	} = useField<string, IncomingFormValues & object>({ name, control });
</script>
