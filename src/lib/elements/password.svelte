<script lang="ts">
	import { useSimpleForm, type AllFormElements, type SimpleForm } from '$lib/use-simple-form';

	const { customValidator } = useSimpleForm();

	const customMsg = 'The password fields must match!';

	const passwordValidator = (el: AllFormElements, data: Record<string, string> ) => {
		return el.value === data['passwordConfirm'] ? null : customMsg;
	};
	const passwordConfirmValidator = (el: AllFormElements, data: Record<string, string> ) => {
		console.log(el.value);
		console.log(data['password']);
		return el.value === data['password'] ? null : customMsg;
	};
</script>

<input
	class="border-2 mt-3"
	name="password"
	type="password"
	required
	use:customValidator={passwordValidator}
/>
<input
	class="border-2 mt-3"
	name="passwordConfirm"
	type="password"
	required
	use:customValidator={passwordConfirmValidator}
/>
