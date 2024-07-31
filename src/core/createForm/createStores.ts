import { Readable, Writable, derived, get, writable } from 'svelte/store';
import { InternalFormState, InternalFormStateCounter } from '../../internal/types/Form';
import { clone, cloneWithStoreReactivity } from '../../internal/util/clone';
import { createTriggers } from '../../internal/util/createTriggers';
import {
	BooleanFields,
	DependencyFieldsInternal,
	ErrorFields,
	FormState,
	LatestFieldEvent,
	ValidateMode,
	ValidatorFields,
} from '../../types/Form';
import { TriggerFields } from './../../types/Form';

type Stores<T extends object> = {
	touched_store: Writable<BooleanFields<T>>;
	dirty_store: Writable<BooleanFields<T>>;
	values_store: Writable<T>;
	validators_store: Writable<ValidatorFields<T>>;
	errors_store: Writable<ErrorFields<T>>;
	deps_store: Writable<DependencyFieldsInternal<T>>;
	triggers_store: Readable<TriggerFields<T>>;
	state_store: Writable<FormState>;
	validate_mode_store: Writable<ValidateMode>;
	latest_field_event_store: Writable<LatestFieldEvent | null>;
	internal_counter_store: Writable<InternalFormStateCounter>;
	internal_state_store: Readable<InternalFormState<T>>;
	value_change_store: Writable<[Array<string | number | symbol>, unknown, boolean] | null>;
};

export function createStores<T extends object>(
	initialTouched: BooleanFields<T>,
	initialDirty: BooleanFields<T>,
	initialValues: T,
	initialValidators: ValidatorFields<T>,
	initialErrors: ErrorFields<T>,
	initialDeps: DependencyFieldsInternal<T>,
	initialState: FormState,
	validateMode: ValidateMode,
): Stores<T> {
	const value_change_store: Writable<[Array<string | number | symbol>, unknown, boolean] | null> =
		writable(null);

	const touched_store = writable(clone(initialTouched));
	const dirty_store = writable(clone(initialDirty));
	const values_store = writable(
		cloneWithStoreReactivity(initialValues, value_change_store, touched_store, dirty_store),
	);
	const validators_store = writable(clone(initialValidators));
	const errors_store = writable(clone(initialErrors));
	const deps_store = writable(clone(initialDeps));
	const triggers_store = derived(deps_store, ($deps) => createTriggers(get(values_store), $deps));

	const state_store = writable(clone(initialState));
	const validate_mode_store = writable(validateMode);
	const latest_field_event_store = writable<LatestFieldEvent | null>(null);

	const internal_counter_store = writable<InternalFormStateCounter>({
		validations: 0,
		submits: 0,
	});

	const internal_state_store = derived(
		[
			values_store,
			touched_store,
			dirty_store,
			validators_store,
			errors_store,
			deps_store,
			triggers_store,
			state_store,
			validate_mode_store,
		],
		([
			$values,
			$touched,
			$dirty,
			$validators,
			$errors,
			$deps,
			$triggers,
			$state,
			$validateMode,
		]): InternalFormState<T> => ({
			values: $values,
			touched: $touched,
			dirty: $dirty,
			validators: $validators,
			errors: $errors,
			deps: $deps,
			triggers: $triggers,
			state: $state,
			validateMode: $validateMode,
		}),
	);

	return {
		touched_store,
		dirty_store,
		values_store,
		validators_store,
		errors_store,
		deps_store,
		triggers_store,
		state_store,
		validate_mode_store,
		latest_field_event_store,
		internal_counter_store,
		internal_state_store,
		value_change_store,
	};
}
