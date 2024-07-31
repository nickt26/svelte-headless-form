import { TriggerFields } from '../../types/Form';

export function depsAreCircular<T extends object>(triggers: TriggerFields<T>): string[] {
	return [];
}
