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
		subscribe: (run: Subscriber<Exclude<T, I>>, invalidate: Invalidator<T>) => {
			const newRun: Subscriber<T> = (val) => {
				if (ignorable?.some((x) => x === val)) {
					return;
				}
				run(val as Exclude<T, I>);
			};
			return val_store.subscribe(newRun, invalidate);
		},
		set: val_store.set,
		update: val_store.update,
	};
}
