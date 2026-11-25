<script lang="ts">
	import type { Snippet } from 'svelte';
	import Capybara from './Capybara.svelte';
	let { title, body, mascot = true, children }: { title: string; body?: string; mascot?: boolean; children?: Snippet } = $props();
</script>

<div class="empty">
	{#if mascot}<Capybara size={72} mood="think" />{/if}
	<p class="title">{title}</p>
	{#if body}<p class="body">{body}</p>{/if}
	{#if children}<div class="cta">{@render children()}</div>{/if}
</div>

<style lang="scss">
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--sp-2);
		padding: var(--sp-6) var(--sp-4);
		border: 1.5px dashed var(--c-border-strong);
		border-radius: var(--r-lg);
		background: var(--c-surface);
	}
	.title {
		font-weight: 600;
	}
	.body {
		color: var(--c-text-muted);
		font-size: var(--fs-sm);
		max-width: 44ch;
	}
	.cta {
		margin-top: var(--sp-2);
	}
</style>
