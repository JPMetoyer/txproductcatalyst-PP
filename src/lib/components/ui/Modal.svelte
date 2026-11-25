<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
		footer?: Snippet;
		wide?: boolean;
	}
	let { open, title, onclose, children, footer, wide = false }: Props = $props();
	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog bind:this={dialog} class:wide onclose={onclose} onclick={(e) => e.target === dialog && onclose()} aria-labelledby="modal-title">
	<div class="inner">
		<header>
			<h2 id="modal-title">{title}</h2>
			<button class="x" onclick={onclose} aria-label="Close"><X size={18} /></button>
		</header>
		<div class="body">{@render children()}</div>
		{#if footer}<footer>{@render footer()}</footer>{/if}
	</div>
</dialog>

<style lang="scss">
	dialog {
		border: 0;
		padding: 0;
		border-radius: var(--r-xl);
		width: min(560px, calc(100vw - 32px));
		max-height: calc(100vh - 64px);
		box-shadow: var(--shadow-lg);
		color: var(--c-text);
		&.wide {
			width: min(760px, calc(100vw - 32px));
		}
		&::backdrop {
			background: rgba(32, 35, 55, 0.4);
			backdrop-filter: blur(2px);
		}
	}
	.inner {
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 64px);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sp-4) var(--sp-5);
		border-bottom: 1px solid var(--c-border);
	}
	h2 {
		font-size: var(--fs-md);
	}
	.body {
		padding: var(--sp-5);
		overflow-y: auto;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--sp-2);
		padding: var(--sp-4) var(--sp-5);
		border-top: 1px solid var(--c-border);
		background: var(--c-bg);
	}
	.x {
		background: none;
		border: 0;
		cursor: pointer;
		color: var(--c-text-muted);
		display: grid;
		padding: 4px;
		border-radius: 6px;
		&:hover {
			background: var(--c-surface-2);
		}
	}
</style>
