<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		title?: string;
		eyebrow?: string;
		action?: Snippet;
		children: Snippet;
		pad?: boolean;
		tone?: 'default' | 'highlight';
		id?: string;
	}
	let { title, eyebrow, action, children, pad = true, tone = 'default', id }: Props = $props();
</script>

<section class="card {tone}" class:pad {id} aria-labelledby={title && id ? `${id}-title` : undefined}>
	{#if title || action}
		<header>
			<div>
				{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
				{#if title}<h2 id={id ? `${id}-title` : undefined}>{title}</h2>{/if}
			</div>
			{#if action}<div class="action">{@render action()}</div>{/if}
		</header>
	{/if}
	{@render children()}
</section>

<style lang="scss">
	.card {
		@include card;
		box-shadow: var(--shadow-sm);
		min-width: 0;
	}
	.pad {
		padding: var(--sp-5);
	}
	.highlight {
		background:
			linear-gradient(var(--c-surface), var(--c-surface)) padding-box,
			var(--tpc-gradient) border-box;
		border: 1.5px solid transparent;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sp-3);
		margin-bottom: var(--sp-4);
	}
	h2 {
		font-size: var(--fs-md);
	}
	.eyebrow {
		@include eyebrow;
		display: block;
		margin-bottom: 2px;
	}
	.action {
		flex-shrink: 0;
	}
</style>
