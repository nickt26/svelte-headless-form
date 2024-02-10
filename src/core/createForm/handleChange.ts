import { Writable } from 'svelte/store';
import { parseIntOrNull } from '../../internal/util/parseIntOrNull';
import { HandleChangeFn, LatestFieldEvent } from '../../types/Form';

export function createHandleChange(
	latest_field_event_store: Writable<LatestFieldEvent>,
	updateValue: (name: string, value: unknown) => Promise<void>,
): HandleChangeFn {
	return async (e) => {
		if (e.currentTarget.name === undefined || e.currentTarget.name === '') return;

		latest_field_event_store.set({ field: e.currentTarget.name, event: 'beforeChange' });

		switch (e.currentTarget.type) {
			case 'checkbox':
			case 'radio':
				await updateValue(e.currentTarget.name, e.currentTarget.checked);
				break;
			case 'range':
			case 'number':
				await updateValue(e.currentTarget.name, parseIntOrNull(e.currentTarget.value));
				break;
			case 'file':
				await updateValue(e.currentTarget.name, e.currentTarget.files);
				break;
			default:
				await updateValue(e.currentTarget.name, e.currentTarget.value);
				break;
		}

		latest_field_event_store.set({ field: e.currentTarget.name, event: 'afterChange' });
	};
}
