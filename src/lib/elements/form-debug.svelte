<script lang="ts">
	import { useSimpleForm } from '$lib/use-simple-form';

	const { data } = useSimpleForm();
</script>

{#if $data}
	<pre>{JSON.stringify($data, null, 2)}</pre>
{/if}
