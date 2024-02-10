import { parseIntOrNull } from '../../internal/util/parseIntOrNull';
import { HandleChangeFn, HandlerFn, RegisterFn } from '../../types/Form';

const inputTypes = [
	'checkbox',
	'radio',
	'file',
	'text',
	'password',
	'number',
	'range',
	'color',
	'date',
	'datetime',
	'email',
	'datetime-local',
	'month',
	'time',
	'url',
	'week',
	'tel',
	'search',
] as const;

type InputType = (typeof inputTypes)[number];
type RegisterType = InputType | 'select' | 'textarea';

const typeToValueConverterMap: Record<RegisterType, (value: any) => any> = {
	checkbox: (value: boolean) => value,
	radio: (value: boolean) => value,
	file: (value: FileList) => value,
	select: (value: string | string[]) => value,
	text: (value: string) => value,
	password: (value: string) => value,
	number: (value: string) => parseIntOrNull(value),
	range: (value: string) => parseIntOrNull(value),
	color: (value: string) => value,
	date: (value: string) => value,
	datetime: (value: string) => value,
	email: (value: string) => value,
	'datetime-local': (value: string) => value,
	month: (value: string) => value,
	time: (value: string) => value,
	url: (value: string) => value,
	week: (value: string) => value,
	tel: (value: string) => value,
	search: (value: string) => value,
	textarea: (value: string) => value,
};

const typeToValueMap: Record<RegisterType, 'value' | 'files' | 'checked' | ({} & string)> = {
	checkbox: 'checked',
	radio: 'checked',
	file: 'files',
	select: 'value',
	text: 'value',
	password: 'value',
	number: 'value',
	range: 'value',
	color: 'value',
	date: 'value',
	datetime: 'value',
	email: 'value',
	'datetime-local': 'value',
	month: 'value',
	time: 'value',
	url: 'value',
	week: 'value',
	tel: 'value',
	search: 'value',
	textarea: 'value',
} as const;

export const createRegister = (
	handleChange: HandleChangeFn,
	handleBlur: HandlerFn,
	handleFocus: HandlerFn,
): RegisterFn<object> => {
	return (node, { name }): { destroy: () => void } => {
		node.name = name;
		const registerHandleChange = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
			handleChange(e);
		const registerHandleBlur = () => handleBlur(name);
		const registerHandleFocus = () => handleFocus(name);

		switch (node.type) {
			case 'checkbox':
			case 'radio':
			case 'file':
				node.addEventListener('change', registerHandleChange as any);
				break;
			default:
				node.addEventListener('input', registerHandleChange as any);
				break;
		}
		node.addEventListener('blur', registerHandleBlur);
		node.addEventListener('focus', registerHandleFocus);

		return {
			destroy() {
				switch (node.type) {
					case 'checkbox':
					case 'radio':
					case 'file':
						node.removeEventListener('change', registerHandleChange as any);
						break;
					default:
						node.removeEventListener('input', registerHandleChange as any);
						break;
				}
				node.removeEventListener('blur', registerHandleBlur);
				node.removeEventListener('focus', registerHandleFocus);
			},
		};
	};
};
