import { PartialErrorFields } from '../../types/Form';
import { getInternal, getTriggers } from './get';
import { isNil } from './isNil';
import { isObject } from './isObject';
import { setImpure } from './set';

export const isFormValidSchemaless = async (
	allFormValues: any,
	allFormValidators: any,
	allFormDeps: any,
	allFormTriggers: any,
	allFormTouched: any,
	allFormDirty: any,
	currentFormValue: any,
	currentFormValidator: any | undefined,
	currentFormDep: any | undefined,
	errors: any = {},
	currentKey = '',
	isFormValid: [boolean] = [true],
	validatedFields: string[] = [],
): Promise<[boolean, PartialErrorFields<object> | string | boolean]> => {
	if (!isObject(currentFormValue) && !Array.isArray(currentFormValue)) {
		if (validatedFields.includes(currentKey)) return [isFormValid[0], errors];
		if (currentFormDep?.length > 0) return [isFormValid[0], errors];

		const validator = currentFormValidator;
		if (
			!isNil(validator) &&
			!isObject(validator) &&
			!Array.isArray(validator) &&
			typeof validator === 'function'
		) {
			const validatorResult = (await validator(currentFormValue, {
				values: allFormValues,
				touched: allFormTouched,
				dirty: allFormDirty,
				errors,
			})) as string | false;

			setImpure(currentKey, validatorResult, errors);
			if (isFormValid[0]) isFormValid[0] = !validatorResult;
			return [isFormValid[0], errors];
		}

		setImpure(currentKey, false, errors);
		validatedFields.push(currentKey);
		return [isFormValid[0], errors];
	}

	for (const key of Object.keys(currentFormValue)) {
		const keyToPush = currentKey ? `${currentKey}.${key}` : key;
		if (validatedFields.includes(keyToPush)) continue;
		if (currentFormDep?.[key]?.length > 0) continue;

		const fieldVal = currentFormValue[key as any];

		const fieldTriggers = getTriggers(keyToPush, allFormTriggers);
		const fieldMustTrigger = !isNil(fieldTriggers);

		if (fieldMustTrigger) {
			for (const triggerPath of fieldTriggers) {
				await isFormValidSchemaless(
					allFormValues,
					allFormValidators,
					allFormDeps,
					allFormTriggers,
					allFormTouched,
					allFormDirty,
					getInternal(triggerPath, allFormValues),
					getInternal(triggerPath, allFormValidators),
					undefined,
					errors,
					triggerPath,
					isFormValid,
					validatedFields,
				);
			}
		}

		await isFormValidSchemaless(
			allFormValues,
			allFormValidators,
			allFormDeps,
			allFormTriggers,
			allFormTouched,
			allFormDirty,
			fieldVal,
			getInternal(keyToPush, allFormValidators),
			getTriggers(keyToPush, allFormDeps),
			errors,
			keyToPush,
			isFormValid,
			validatedFields,
		);
	}

	return [isFormValid[0], errors];
};

// What we want to achieve:
// Iterate over all of the fields in the form and run their validators to update their error states.
// If an error is found we want to set the form validity to false and update the errors object.
// If a field has dependencies we want to skip it and only run it's validators when the fields it depends on have had their validators run
// If a field has dependents then we want to run their validators when the field has finished running it's validators and has been updated
// Triggering a dependent field should trigger all of it's dependents to run their validators
// What happens with circular dependencies? We should probably throw an error if we detect a circular dependency

// export const runTriggers = async <T extends object>(
// 	triggers: string[],
// 	validatorFormState: InternalFormState<T>,
// 	isFormValid: [boolean],
// 	errors: PartialErrorFields<T>,
// ): Promise<void> => {
// 	for (const trigger of triggers) {
// 		const triggerValue = getInternal<TriggerObject | string[]>(trigger, validatorFormState.values);
// 		if (
// 			isObject(triggerValue) ||
// 			(Array.isArray(triggerValue) && triggerValue.some((x) => isObject(x) || Array.isArray(x)))
// 		) {
// 			await isFormValidObject<typeof triggerValue, T>(
// 				triggerValue,
// 				getInternal<Validators<T, typeof triggerValue>>(trigger, validatorFormState.validators),
// 				undefined, // send undefined here since we don't care about dependencies for triggers
// 				getTriggers<TriggerFields<typeof triggerValue>>(trigger, validatorFormState.triggers),
// 				validatorFormState,
// 				isFormValid,
// 				errors,
// 			);
// 		} else {
// 			await isFormValidPrimitive<typeof triggerValue, T>(
// 				triggerValue,
// 				getInternal<ValidatorFn<T>>(trigger, validatorFormState.validators),
// 				undefined, // send undefined here since we don't care about dependencies for triggers
// 				getTriggers<string[]>(trigger, validatorFormState.triggers),
// 				validatorFormState,
// 				trigger,
// 				isFormValid,
// 				errors,
// 			);
// 		}
// 	}
// };

// export const isFormValidPrimitive = async <T, V extends object>(
// 	currentValue: T,
// 	currentValidator: ValidatorFn<V> | undefined,
// 	currentDeps: string[] | undefined,
// 	currentTrigger: string[] | undefined,
// 	validatorFormState: InternalFormState<V>,
// 	key: string | number | symbol,
// 	isFormValid: [boolean],
// 	errors: PartialErrorFields<V>,
// ): Promise<void> => {
// 	if (currentDeps?.some((x) => isObject(x) || Array.isArray(x))) return;

// 	const errResult = (await currentValidator?.(currentValue, validatorFormState)) ?? false;
// 	setImpure(key.toString(), errResult, errors);
// 	isFormValid[0] = errResult !== false ? false : isFormValid[0];

// 	await runTriggers(currentTrigger ?? [], validatorFormState, isFormValid, errors);
// };

// export const isFormValidObject = async <T extends object, V extends object>(
// 	currentValue: T,
// 	currentValidator: Validators<V, T> | undefined,
// 	currentDeps: DependencyFieldsInternal<T> | undefined,
// 	currentTrigger: TriggerFields<T> | undefined,
// 	validatorFormState: InternalFormState<V>,
// 	isFormValid: [boolean] = [true],
// 	errors: PartialErrorFields<V> = {},
// ): Promise<[boolean, PartialErrorFields<V>]> => {
// 	for (const key in currentValue) {
// 		const val = currentValue[key];
// 		const validator = currentValidator?.[key];
// 		const deps = currentDeps?.[key];
// 		const triggers = currentTrigger?.[key];

// 		if (isObject(val) || Array.isArray(val)) {
// 			await isFormValidObject<typeof val, V>(
// 				val,
// 				validator as Validators<V, typeof val>,
// 				deps as DependencyFieldsInternal<typeof val>,
// 				triggers as TriggerFields<typeof val>,
// 				validatorFormState,
// 				isFormValid,
// 				errors,
// 			);

// 			await runTriggers(
// 				(triggers as TriggerObject)?.triggers ?? [],
// 				validatorFormState,
// 				isFormValid,
// 				errors,
// 			);

// 			continue;
// 		}

// 		if (((deps as string[])?.length ?? 0) > 0) continue;

// 		await isFormValidPrimitive<typeof val, V>(
// 			val,
// 			validator as ValidatorFn<V>,
// 			deps as string[],
// 			triggers as string[],
// 			validatorFormState,
// 			key,
// 			isFormValid,
// 			errors,
// 		);

// 		await runTriggers(triggers as string[], validatorFormState, isFormValid, errors);
// 	}
// 	return [isFormValid[0], errors];
// };

// export const isFormValidSchemaless = async <T extends object, V = unknown>(
// 	currentValue: V,
// 	currentValidator: (V extends object ? ValidatorFields<V> : ValidatorFn<T>) | undefined,
// 	validatorFormState: InternalFormState<T>,
// 	currentDeps: (V extends object ? DependencyFieldsInternal<V> : string[]) | undefined,
// 	currentTriggers: (V extends object ? TriggerFields<V> : string[]) | undefined,
// 	keyParam: V extends object ? null : string | number | symbol,
// 	formValidity: boolean = true,
// 	errors: Record<string | number | symbol, string | false> = {},
// ): Promise<[boolean, PartialErrorFields<T>]> => {
// 	if (!(isObject(currentValue) || Array.isArray(currentValue))) {
// 		const fieldHasDeps =
// 			currentDeps !== undefined && Array.isArray(currentDeps) && currentDeps.length > 0;
// 		if (fieldHasDeps) return [formValidity, errors as PartialErrorFields<T>];
// 		if (currentValidator && typeof currentValidator === 'function') {
// 			const errResult = await currentValidator(currentValue, validatorFormState);
// 			// errors[keyParam as string] = errResult;
// 			setImpure(keyParam as string, errResult, errors);
// 			if (errResult !== false) formValidity = false;
// 		}
// 		return [formValidity, errors as PartialErrorFields<T>];
// 	}

// 	for (const key in currentValue) {
// 		const fieldHasDeps =
// 			currentDeps !== undefined &&
// 			Array.isArray(currentDeps[key as keyof typeof currentDeps]) &&
// 			!(currentDeps[key as keyof typeof currentDeps] as string[]).some(
// 				(x) => isObject(x) || Array.isArray(x),
// 			) &&
// 			(currentDeps[key as keyof typeof currentDeps] as string[]).length > 0;
// 		if (fieldHasDeps) continue;

// 		const val = currentValue[key];

// 		if (isObject(val) || Array.isArray(val)) {
// 			const [isValid, childErrors] = await isFormValidSchemaless<T, typeof val>(
// 				val,
// 				currentValidator?.[key as keyof typeof currentValidator] as
// 					| ValidatorFields<typeof val>
// 					| undefined,
// 				validatorFormState,
// 				currentDeps?.[key as keyof typeof currentDeps] as
// 					| DependencyFieldsInternal<typeof val>
// 					| undefined,
// 				(currentTriggers?.[key as keyof typeof currentTriggers] as TriggerObject<typeof val>)
// 					?.values as TriggerFields<typeof val> | undefined,
// 				null,
// 				formValidity,
// 				empty(val) as Record<string | number | symbol, string | false>,
// 			);

// 			for (const trigger of (
// 				currentTriggers?.[key as keyof typeof currentTriggers] as TriggerObject<typeof val>
// 			)?.triggers ?? []) {
// 				console.log(`Checking trigger: ${trigger}`);

// 				const triggerValue = getInternal(trigger, validatorFormState.values);
// 				if (isObject(triggerValue) || Array.isArray(triggerValue)) {
// 					const [isValidTrigger, childErrors] = await isFormValidSchemaless(
// 						triggerValue,
// 						getInternal<ValidatorFields<typeof triggerValue>>(
// 							trigger,
// 							validatorFormState.validators,
// 						),
// 						validatorFormState,
// 						getInternal<DependencyFieldsInternal<typeof triggerValue>>(
// 							trigger,
// 							validatorFormState.deps,
// 						),
// 						(
// 							getTriggers(trigger, validatorFormState.triggers) as TriggerObject<
// 								typeof triggerValue
// 							>
// 						)?.values as TriggerFields<typeof triggerValue> | undefined,
// 						null,
// 						formValidity,
// 						empty(triggerValue) as Record<string | number | symbol, string | false>,
// 					);
// 					formValidity = formValidity ? isValidTrigger : formValidity;
// 					setImpure(trigger, childErrors, errors);
// 					// errors[trigger as unknown as keyof typeof errors] = childErrors as any;
// 				} else {
// 					const [isValid] = await isFormValidSchemaless(
// 						triggerValue,
// 						getInternal<ValidatorFn<T>>(trigger, validatorFormState.validators),
// 						validatorFormState,
// 						getInternal<string[]>(trigger, validatorFormState.deps),
// 						getTriggers<string[]>(trigger, validatorFormState.triggers),
// 						trigger,
// 						formValidity,
// 						errors,
// 					);

// 					formValidity = formValidity ? isValid : formValidity;
// 					// const triggerValidatorFn = getInternal<ValidatorFn<T>>(trigger, validatorFormState.validators);
// 					// if (triggerValidatorFn && typeof triggerValidatorFn === 'function') {
// 					// 	const triggerErrors = await triggerValidatorFn(triggerValue, validatorFormState as unknown as any);
// 					// 	errors[trigger as unknown as keyof typeof errors] = triggerErrors as any;
// 					// 	if (triggerErrors !== false) formValidity = false;
// 					// }
// 				}
// 			}
// 			formValidity = formValidity ? isValid : formValidity;
// 			errors[key as unknown as keyof typeof errors] = childErrors as any;
// 			continue;
// 		}

// 		const [isValid, childErrors] = await isFormValidSchemaless<T, typeof val>(
// 			val,
// 			currentValidator?.[key as keyof typeof currentValidator] as
// 				| ValidatorFields<typeof val>
// 				| undefined,
// 			validatorFormState,
// 			currentDeps?.[key as keyof typeof currentDeps] as
// 				| DependencyFieldsInternal<typeof val>
// 				| undefined,
// 			(currentTriggers?.[key as keyof typeof currentTriggers] as TriggerObject<typeof val>)
// 				?.values as TriggerFields<typeof val> | undefined,
// 			null,
// 			formValidity,
// 			empty(val) as Record<string | number | symbol, string | false>,
// 		);

// 		// if (validatorFn && typeof validatorFn === 'function') {
// 		// 	const errResult = await (validatorFn as ValidatorFn<V>)(val, validatorFormState as unknown as any);
// 		// 	errors[key as unknown as keyof typeof errors] = errResult as any;
// 		// 	if (errResult !== false) formValidity = false;
// 		// }

// 		// for (const trigger of (currentTriggers?.[key] as string[]) ?? []) {
// 		// 	console.log(`Checking trigger: ${trigger}`);

// 		// 	const triggerValue = getInternal(trigger, validatorFormState.values);
// 		// 	if (isObject(triggerValue) || Array.isArray(triggerValue)) {
// 		// 		const [isValidTrigger, childErrors] = await isFormValidSchemaless(
// 		// 			triggerValue,
// 		// 			getInternal<ValidatorFields<typeof triggerValue>>(trigger, validatorFormState.validators),
// 		// 			validatorFormState,
// 		// 			getInternal<DependencyFieldsInternal<typeof triggerValue>>(trigger, validatorFormState.deps),
// 		// 			(getTrigger(trigger, validatorFormState.triggers) as TriggerObject<typeof triggerValue>)?.values as
// 		// 				| TriggerFields<typeof triggerValue>
// 		// 				| undefined,
// 		// 			formValidity,
// 		// 			errors,
// 		// 		);
// 		// 		formValidity = formValidity ? isValidTrigger : formValidity;
// 		// 		errors[trigger as unknown as keyof		// if (validatorFn && typeof validatorFn === 'function') {
// 		// 	const errResult = await (validatorFn as ValidatorFn<V>)(val, validatorFormState as unknown as any);
// 		// 	errors[key as unknown as keyof typeof errors] = errResult as any;
// 		// 	if (errResult !== false) formValidity = false;
// 		// }

// 		// for (const trigger of (currentTriggers?.[key] as string[]) ?? []) {
// 		// 	console.log(`Checking trigger: ${trigger}`);

// 		// 	const triggerValue = getInternal(trigger, validatorFormState.values);
// 		// 	if (isObject(triggerValue) || Array.isArray(triggerValue)) {
// 		// 		const [isValidTrigger, childErrors] = await isFormValidSchemaless(
// 		// 			triggerValue,
// 		// 			getInternal<ValidatorFields<typeof triggerValue>>(trigger, validatorFormState.validators),
// 		// 			validatorFormState,
// 		// 			getInternal<DependencyFieldsInternal<typeof triggerValue>>(trigger, validatorFormState.deps),
// 		// 			(getTrigger(trigger, validatorFormState.triggers) as TriggerObject<typeof triggerValue>)?.values as
// 		// 				| TriggerFields<typeof triggerValue>
// 		// 				| undefined,
// 		// 			formValidity,
// 		// 			errors,
// 		// 		);
// 		// 		formValidity = formValidity ? isValidTrigger : formValidity;
// 		// 		errors[trigger as unknown as keyof typeof errors] = childErrors as any;
// 		// 	} else {
// 		// 		const triggerValidatorFn = getInternal<ValidatorFn<T>>(trigger, validatorFormState.validators);
// 		// 		if (triggerValidatorFn && typeof triggerValidatorFn === 'function') {
// 		// 			const triggerErrors = await triggerValidatorFn(triggerValue, validatorFormState as unknown as any);
// 		// 			errors[trigger as unknown as keyof typeof errors] = triggerErrors as any;
// 		// 			if (triggerErrors !== false) formValidity = false;
// 		// 		}
// 		// 	}
// 		// } typeof errors] = childErrors as any;
// 		// 	} else {
// 		// 		const triggerValidatorFn = getInternal<ValidatorFn<T>>(trigger, validatorFormState.validators);
// 		// 		if (triggerValidatorFn && typeof triggerValidatorFn === 'function') {
// 		// 			const triggerErrors = await triggerValidatorFn(triggerValue, validatorFormState as unknown as any);
// 		// 			errors[trigger as unknown as keyof typeof errors] = triggerErrors as any;
// 		// 			if (triggerErrors !== false) formValidity = false;
// 		// 		}
// 		// 	}
// 		// }
// 	}

// 	return [formValidity, errors as PartialErrorFields<T>];
// };

// export const isFormValidSchema = async <T extends object>(
// 	values: T,
// 	validationResolver: ValidationResolver<T>,
// ): Promise<[boolean, PartialErrorFields<T>]> => {
// 	const errors = await validationResolver(values);
// 	const formValidity = Object.keys(errors).length === 0;
// 	return [formValidity, errors];
// };
