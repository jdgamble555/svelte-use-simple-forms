<script lang="ts">
	let secondInput: HTMLInputElement;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		secondInput.value = target.value;
		secondInput.dispatchEvent(new Event('input', { bubbles: true }));
	}
</script>

<input class="border-2 mt-3" on:input={handleInput} data-simple-form-ignore />
<input type="hidden" name="test" bind:this={secondInput} />
