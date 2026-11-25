<script lang="ts">
	import Capybara from './Capybara.svelte';
	let { title, phase, items }: { title: string; phase: string; items: string[] } = $props();
</script>

<div class="cs">
	<Capybara size={88} mood="think" />
	<div>
		<span class="tag">{phase}</span>
		<h1>{title}</h1>
		<p>This screen is planned but not built in the prototype yet. It will include:</p>
		<ul>{#each items as i}<li>{i}</li>{/each}</ul>
	</div>
</div>

<style lang="scss">
	.cs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-5);
		align-items: flex-start;
		@include card;
		padding: var(--sp-6);
		max-width: 720px;
	}
	.tag {
		@include eyebrow;
		color: var(--deep-pink);
	}
	h1 {
		font-size: var(--fs-xl);
		margin: 4px 0 var(--sp-2);
	}
	p {
		color: var(--c-text-muted);
	}
	ul {
		margin: var(--sp-3) 0 0;
		padding-left: 1.2em;
		display: grid;
		gap: 4px;
	}
</style>
