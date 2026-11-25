<script lang="ts" module>
	export type Tone = 'blue' | 'pink' | 'orange' | 'lavender' | 'green' | 'red' | 'neutral' | 'ink';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tone = 'neutral', dot = false, children }: { tone?: Tone; dot?: boolean; children: Snippet } = $props();
</script>

<span class="badge {tone}">
	{#if dot}<span class="dot" aria-hidden="true"></span>{/if}
	{@render children()}
</span>

<style lang="scss">
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: var(--fs-xs);
		font-weight: 600;
		line-height: 1.6;
		white-space: nowrap;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}
	.neutral { background: var(--c-surface-2); color: var(--c-text-muted); }
	.ink { background: var(--tpc-ink); color: #fff; }
	.blue { background: var(--tint-blue); color: var(--deep-blue); }
	.pink { background: var(--tint-pink); color: var(--deep-pink); }
	.orange { background: var(--tint-orange); color: var(--deep-orange); }
	.lavender { background: var(--tint-lavender); color: var(--deep-lavender); }
	.green { background: var(--tint-green); color: var(--deep-green); }
	.red { background: var(--tint-red); color: var(--deep-red); }
</style>
