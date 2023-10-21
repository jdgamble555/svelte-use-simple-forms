<script lang="ts">
	import Input from '$lib/elements/Input.svelte';
	import FormDebug from '$lib/elements/form-debug.svelte';
	import Password from '$lib/elements/password.svelte';
	import { useSimpleForm } from '$lib/use-simple-form';

	// snapshot - https://github.com/sveltejs/kit/issues/5478

	const { simple } = useSimpleForm();

</script>

<p>My Form</p>

<form lang="es" use:simple>
	<div class="flex flex-col items-start">
		<Input />
		<Password />
		<button type="submit" class="mt-3 border-4">Submit</button>
	</div>
</form>
<FormDebug />
