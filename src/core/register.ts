import { getInternal } from '../internal/util/get';
import { FormControl } from '../types/Form';

export function register<T extends object>(
	node: HTMLInputElement,
	{ name, control, parseFn }: { name: string; control: FormControl<T>; parseFn?: <V>(value: any) => V }
) {
	const fieldFns = control.field;

	const handleChange = ({ target: { value } }: any) => fieldFns.handleChange(name, parseFn ? parseFn(value) : value);
	const handleBlur = () => fieldFns.handleBlur(name);
	const handleFocus = () => fieldFns.handleFocus(name);

	node.addEventListener('input', handleChange);
	node.addEventListener('blur', handleBlur);
	node.addEventListener('focus', handleFocus);
	const valuesUnsubscribe = control.values.subscribe(
		(values) => (node.value = parseFn ? parseFn(getInternal(name, values)!) : getInternal(name, values)!)
	);

	return {
		destroy() {
			node.removeEventListener('input', handleChange);
			node.removeEventListener('blur', handleBlur);
			node.removeEventListener('focus', handleFocus);
			valuesUnsubscribe();
		}
	};
}
