<script lang="ts">
	import * as yup from 'yup';
	import z from 'zod';
	import { str } from '../../../../src/core/test';

	// const { register, values } = createForm({
	// 	initialValues: {
	// 		selection: '',
	// 	},
	// 	initialValidators: {
	// 		selection: (value) => (value.length > 0 ? false : 'Selection is required'),
	// 	},
	// });

	const schema = yup.object().shape({
		username: yup
			.string()
			.required()
			.test('random', 'This is the error', (val) => {
				console.log('val from yup', val);
				return true;
			}),
		password: yup.string().when('username', {
			is: (username: any) => username.length === 0,
			then: (schem) => schem.required(),
		}),
	});
	type FormType = yup.InferType<typeof schema>;

	const test: FormType = {
		username: 'Banana',
		password: '',
	};

	function validatePassword(obj: any) {
		console.log('validating password');
		try {
			const res = schema.validateSyncAt('password', obj);
		} catch (err) {
			console.log(err);
		}
	}

	$: validatePassword(test);

	const stringValidator = str().len(6).build();
	const isValidString = stringValidator('1234567');
</script>

<div>
	<div>{JSON.stringify(isValidString)}</div>
	<label for="username">Username</label>
	<input id="username" type="text" bind:value={test.username} />

	<label for="password">Password</label>
	<input id="password" type="text" bind:value={test.password} />
</div>
