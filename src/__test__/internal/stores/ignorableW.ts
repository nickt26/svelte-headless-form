import { Unsubscriber } from 'svelte/motion';
import { Invalidator, Subscriber, Writable, writable } from 'svelte/store';

export interface IWritable<T, I extends T> extends Writable<T> {
	subscribe: (
		this: void,
		run: Subscriber<Exclude<T, I>>,
		invalidate: Invalidator<T>,
	) => Unsubscriber;
	set: (value: T) => void;
	update: (updater: (value: T) => T) => void;
}

export function ignorableW<T, I extends T>(val: T, ignorable?: Array<I>): IWritable<T, I> {
	const val_store = writable(val);
	return {
		subscribe: (subscriber: Subscriber<Exclude<T, I>>, invalidate: Invalidator<T>) => {
			return val_store.subscribe((val) => {
				if (!ignorable?.some((x) => x === val)) {
					subscriber(val as Exclude<T, I>);
				}
			}, invalidate);
		},
		set: val_store.set,
		update: val_store.update,
	};
}
