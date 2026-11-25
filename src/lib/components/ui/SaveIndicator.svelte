<script lang="ts">
	import { Check, LoaderCircle, CircleAlert, TriangleAlert } from '@lucide/svelte';
	import type { SaveState } from '$lib/types/domain';
	let { state, compact = false }: { state: SaveState; compact?: boolean } = $props();
	const label: Record<SaveState, string> = {
		idle: 'All changes saved',
		saving: 'Saving…',
		saved: 'Saved',
		error: 'Couldn’t save — retry',
		conflict: 'Edit conflict'
	};
</script>

<span class="si {state}" class:compact role="status" aria-live="polite">
	{#if state === 'saving'}<LoaderCircle size={14} class="spin" aria-hidden="true" />
	{:else if state === 'error'}<CircleAlert size={14} aria-hidden="true" />
	{:else if state === 'conflict'}<TriangleAlert size={14} aria-hidden="true" />
	{:else}<Check size={14} aria-hidden="true" />{/if}
	<span class:sr-only={compact}>{label[state]}</span>
</span>

<style lang="scss">
	.si {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-xs);
		font-weight: 500;
		color: var(--c-text-faint);
	}
	.saved,
	.idle {
		color: var(--deep-green);
	}
	.error {
		color: var(--deep-red);
	}
	.conflict {
		color: var(--deep-orange);
	}
	:global(.spin) {
		animation: spin 0.9s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
