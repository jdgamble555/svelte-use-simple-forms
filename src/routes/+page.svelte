<script lang="ts">
	import Input from '$lib/elements/Input.svelte';
	import FormDebug from '$lib/elements/form-debug.svelte';
	import Password from '$lib/elements/password.svelte';
	import { useSimpleForm } from '$lib/use-simple-form';

	const { simple } = useSimpleForm();
</script>

<p>My Form</p>

<form use:simple>
	<div class="flex flex-col items-start">
		<Input />
		<Password />
		<button type="submit" class="border-4 mt-3">Submit</button>
	</div>
</form>
<FormDebug />
