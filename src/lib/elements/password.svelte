<script lang="ts">
	import { useSimpleForm, type FormDataElement } from '$lib/use-simple-form';

	const { customValidator } = useSimpleForm();

	const customMsg = 'The password fields must match!';

	const passwordValidator = (element: FormDataElement, data: Record<string, string>) => {
		return element.value === data['passwordConfirm'] ? null : customMsg;
	};
	const passwordConfirmValidator = (element: FormDataElement, data: Record<string, string>) => {
		return element.value === data['password'] ? null : customMsg;
	};
</script>

<input
	class="mt-3 border-2 outline-none data-[touched]:invalid:border-red-500"
	name="password"
	type="password"
	required
	use:customValidator={passwordValidator}
/>
<input
	class="border-2 mt-3 outline-none data-[touched]:invalid:border-red-500"
	name="passwordConfirm"
	type="password"
	required
	use:customValidator={passwordConfirmValidator}
/>
