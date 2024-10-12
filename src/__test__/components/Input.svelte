<script lang="ts" generics="T extends Obj">
	import { Obj } from '../../../app/src/types/FormValues';
	import { useField } from '../../core/useField';
	import { DotPaths, FormControl } from '../../types/Form';

	export let control: FormControl<T>;
	export let name: DotPaths<T>;
	const {
		field: { value },
		form: { values },
	} = useField({ name, control });
</script>

<input type="text" />
