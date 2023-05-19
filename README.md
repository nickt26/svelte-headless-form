# Svelte Headless Form

A fast, light and batteries-included form library to make you more productive.

## Getting Started

```bash
npm install svelte-headless-form
```

## How to use

### Quick Notes

- All form state is tracked with svelte stores
- Writable form state is state that can be mutated after form creation without consequence and includes:
|   - values
|   - validators (Only relevant with schemaless forms, updating them when using a schema approach will do nothing)
|   - validateMode
|   - deps
- Readable form state is state that is only mutated internally, is only updated through event handlers and includes:
|   - errors
|   - touched
|   - dirty
|   - state

### Schemaless (Validator Per Field)

```html
<script>
    import { createForm } from 'svelte-headless-form';
    const { submitForm, errors, values, register } = createForm({
        validateMode: 'onChange' // default=onChange for schemaless
        initialValues: {
            name: '',
        },
        initialValidators: {
            name: (value) => (value.length > 0 ? false : 'Name is required'),
        }
    });
</script>

<form on:submit|preventDefault={submitForm((values) => console.log(values))}>
    <input
        bind:value={$values.name} // value binding should always occur before attaching event handlers, svelte will run events in the order they appear
        use:register={{ name: 'name' }} // register is a shorthand to attach change, blur and focus event handlers
    />
    {#if $errors.name}
        <div>
            {$errors.name}
        </div>
    {/if}

    <button type="submit">Submit</button>
</form>
```

### Schema (Single Validator For All Fields)

```html
<script>
    import { createForm } from 'svelte-headless-form';
    const { submitForm, errors, values, register } = createForm({
        validateMode: 'onBlur' // default=onBlur for schema
        initialValues: {
            name: '',
        },
        validationResolver: (values) => { // entire function will be run when validation needs to occur
            const errors = {};

            if(values.name.length === 0) {
                errors.name = "Name is required"
            }

            return errors;
        },
    });
</script>

<form on:submit|preventDefault={submitForm((values) => console.log(values))}>
    <input
        type="email"
        bind:value={$values.name}
        use:register={{ name: 'name' }}
    />
    {#if $errors.name}
        <div>
            {$errors.name}
        </div>
    {/if}

    <button type="submit">Submit</button>
</form>
```

## Examples (Apply To Both Schema And Schemaless)

### Form With Objects

```html
<script>
    import { createForm } from 'svelte-headless-form';
    const { submitForm, errors, values, register } = createForm({
        initialValues: {
            nameDetails: {
                firstName: '',
                lastName: ''
            },
        },
        initialValidators: {
            nameDetails: {
                firstName: (val) => (val.length > 0 ? false : 'First Name is required')
            }
        },
    });
</script>

<form on:submit|preventDefault={submitForm(console.log)}>
    <input bind:value={$values.nameDetails.firstName} use:register={{ name: 'nameDetails.firstName' }} /> // Svelte-Headless-Form supports dot path notation for nested properties
    {#if $errors.nameDetails.firstName}
        <div>
            {$errors.nameDetails.firstName}
        </div>
    {/if}
    <input bind:value={$values.nameDetails.lastName} use:register={{ name: 'nameDetails.lastName' }} />


    <button type="submit">Submit</button>
</form>
```

### Form With Field Arrays

```html
<script>
    import { createForm } from 'svelte-headless-form';
    const { submitForm, errors, values, register } = createForm({
        initialValues: {
            roles: ['admin', 'user', 'super user'],
        },
        initialValidators: {
            roles: [
                (val) => (val.length > 0 ? false : 'Role is required'),
                undefined,
                (val) => (val.length > 0 ? false : 'Role is required')
            ],
        },
    });

    const { remove, swap, append, prepend } = useFieldArray('roles'); // provides a set of util functions to work with field arrays
</script>

<form on:submit|preventDefault={submitForm(console.log)}>
    {#each $values.roles as role, i}
        <input bind:value={role} use:register={{ name: `roles.${i}` }} />
        {#if $errors.roles[i]}
            <div>
                {$errors.roles[i]}
            </div>
        {/if}
    {/each}

    <button type="submit">Submit</button>
</form>
```

## Philosophy

Svelte Headless Form allows for 2 different validation implementations, called schema-based validation and schemaless validation.
In the [How To Use](#how-to-use) section we are demonstrating schemaless validation by giving each form value it's own validator in the initialValidators prop.
If you are intereseted in using schema based validaton please give your createForm() a prop called 'validationResolver' which is a single function that returns an object with error strings located at the same path of the corresponding values. In the future we plan to have pre-built validation resolvers for all the major schema based validators like zod, yup and joi to name a few.
