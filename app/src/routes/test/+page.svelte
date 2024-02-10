<script lang="ts">
	import { createForm } from '../../../../src/core/createForm';

	const { register, values } = createForm({
		initialValues: {
			selection: '',
		},
		initialValidators: {
			selection: (value) => (value.length > 0 ? false : 'Selection is required'),
		},
	});
</script>

<div>
	<select value={$values.selection} use:register={{ name: 'selection' }}>
		<option value="1">1</option> <option value="2">2</option><option value="3">3</option><option value="4">4</option
		></select
	>
</div>
