<script lang="ts">
	let secondInput: HTMLInputElement;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		secondInput.value = target.value;
		secondInput.dispatchEvent(new Event('input', { bubbles: true }));
	}
</script>

<input
	class="mt-3 border-2 outline-none data-[touched]:invalid:border-red-500"
	on:input={handleInput}
	data-ignore
/>
<input type="hidden" name="test" bind:this={secondInput} />
