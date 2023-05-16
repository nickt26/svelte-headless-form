<script lang="ts">
	import { useField } from '../../core/useField';
	import { FormControl } from '../../types/Form';

	type IncomingForm = $$Generic;
	type IncomingValidators = $$Generic;
	export let control: FormControl<IncomingForm & object>;
	export let name: string;
	const {
		field: { value },
		form: { values }
	} = useField<string, IncomingForm & object>({ name, control });
</script>

<input type="text" />
