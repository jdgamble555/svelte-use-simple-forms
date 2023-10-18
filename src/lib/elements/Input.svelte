<script lang="ts">
	import ChipInput from './chip-input.svelte';
</script>

<ChipInput />
<input
	class="mt-3 border-2 outline-none data-[touched]:invalid:border-red-500"
	name="buddy"
	value={'fart@'}
	type="email"
	required
/>
<textarea
	class="mt-3 border-2 outline-none data-[touched]:invalid:border-red-500"
	name="text"
	value={'slslslslslsl\nslslsl'}
	minlength="3"
	required
/>
