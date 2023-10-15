<script lang="ts">
	import { useSimpleForm, type AllFormElements } from '$lib/use-simple-form';

	const { customValidator, data } = useSimpleForm();
	const customMsg = 'The password fields must match!';

	const passwordValidator = (el: AllFormElements) => {
		return el.value === $data.values['passwordConfirm'] ? null : customMsg;
	};
	const passwordConfirmValidator = (el: AllFormElements) => {
		return el.value === $data.values['password'] ? null : customMsg;
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
