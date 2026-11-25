<script lang="ts">
	import { toasts, dismiss } from '$lib/stores/toast.svelte';
	import { CircleCheck, CircleAlert, Info, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	const icons = { success: CircleCheck, error: CircleAlert, info: Info };
</script>

<div class="toaster" role="status" aria-live="polite">
	{#each toasts as t (t.id)}
		{@const Icon = icons[t.kind]}
		<div class="toast {t.kind}" transition:fly={{ y: 12, duration: 180 }}>
			<Icon size={16} aria-hidden="true" />
			<span>{t.message}</span>
			<button onclick={() => dismiss(t.id)} aria-label="Dismiss notification"><X size={14} /></button>
		</div>
	{/each}
</div>

<style lang="scss">
	.toaster {
		position: fixed;
		bottom: var(--sp-5);
		right: var(--sp-5);
		left: var(--sp-5);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--sp-2);
		z-index: 100;
		pointer-events: none;
	}
	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		max-width: 420px;
		padding: 10px 12px;
		border-radius: var(--r-md);
		background: var(--tpc-ink);
		color: #fff;
		font-size: var(--fs-sm);
		box-shadow: var(--shadow-lg);
	}
	.success :global(svg:first-child) { color: #7ee2a8; }
	.error :global(svg:first-child) { color: #ff9a9a; }
	button {
		background: none;
		border: 0;
		color: #fff;
		opacity: 0.7;
		cursor: pointer;
		display: grid;
		padding: 2px;
		border-radius: 4px;
		&:hover { opacity: 1; }
	}
</style>
