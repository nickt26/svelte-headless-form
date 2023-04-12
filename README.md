# Svelte Headless Form

A fast, light and batteries-included form library to make you more productive.

## Getting Started

```bash
npm install svelte-headless-form
```

## How to use

```html
<script>
    import { createForm } from 'svelte-headless-form';
    const { submitForm, input, errors, values } = createForm({
        validateMode: 'onBlur', // Defaults - Schemaless:onChange Schema:onBlur
        initialValues: {
            username: '',
            password: ''
        },
        initialValidators: {
            username: (value) => (value.length > 0 ? false : 'Name is required'),
            password: (value) => (value.length > 0 ? false : 'Password is required')
        }
    });
</script>

<form on:submit|preventDefault={submitForm((values) => console.log(values))}>
    <input
        type="text"
        name="username"
        value={$values.username}
        on:input={input.handleChange}
        on:blur={input.handleBlur}
        on:focus={input.handleFocus}
    />
    {#if $errors.username}
        <div>
            {$errors.username}
        </div>
    {/if}

    <input
        type="password"
        name="password"
        value={$values.password}
        on:input={input.handleChange}
        on:blur={input.handleBlur}
        on:focus={input.handleFocus}
    />
    {#if $errors.password}
        <div>
            {$errors.password}
        </div>
    {/if}

    <button type="submit">Submit</button>
</form>
```

## Philosophy

Svelte Headless Form allows for 2 different validation implementations, called schema-based validation and schemaless validation.
In the [How To Use](#how-to-use) section we are demonstrating schemaless validation by giving each form value it's own validator in the initialValidators prop.
If you are intereseted in using schema based validaton please give your createForm() a prop called 'validationResolver' which is a single function that returns an object with error strings located at the same path of the corresponding values. In the future we plan to have pre-built validation resolvers for all the major schema based validators like zod, yup and joi to name a few.

## Roadmap

These roadmap features are not ordered by priority.

 - [x] Support schemaless validation updates after form creation.
 - [x] Support validation dependencies.
 - [ ] Update README with more advanced examples.
 - [ ] Create a website with a tutorial, an API overview and documentation.
 - [ ] Send through entire form state to schemaless validators.
 - [x] Support async schemaless validators.
 - [x] Support schema-based validation.
 - [x] Unify useField and useFieldArray api by passing down control.
 - [ ] Support a revalidateMode in createForm options.
 - [x] Explore simpler options for attaching handleChange, handleBlur and handleFocus events to inputs.

Please consider svelte-headless-form in beta until a 1.0 release.
