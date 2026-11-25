<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title, eyebrow, subtitle, actions }: { title: string; eyebrow?: string; subtitle?: string; actions?: Snippet } = $props();
</script>

<header class="ph">
	<div class="text">
		{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
		<h1>{title}</h1>
		{#if subtitle}<p>{subtitle}</p>{/if}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style lang="scss">
	.ph {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-4);
		margin-bottom: var(--sp-5);
	}
	.text {
		min-width: 0;
	}
	.eyebrow {
		@include eyebrow;
	}
	h1 {
		font-size: var(--fs-xl);
		margin-top: 2px;
		@include up($bp-md) {
			font-size: var(--fs-2xl);
		}
	}
	p {
		color: var(--c-text-muted);
		margin-top: var(--sp-1);
		max-width: 64ch;
	}
	.actions {
		display: flex;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}
</style>
