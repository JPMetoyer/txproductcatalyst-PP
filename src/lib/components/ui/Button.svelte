<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
		size?: 'sm' | 'md';
		href?: string;
		icon?: Component<any>;
		iconRight?: Component<any>;
		full?: boolean;
		children?: Snippet;
	}
	let { variant = 'secondary', size = 'md', href, icon: Icon, iconRight: IconRight, full = false, children, class: cls = '', ...rest }: Props = $props();
</script>

{#if href}
	<a {href} class="btn {variant} {size} {cls}" class:full>
		{#if Icon}<Icon size={16} aria-hidden="true" />{/if}
		{@render children?.()}
		{#if IconRight}<IconRight size={16} aria-hidden="true" />{/if}
	</a>
{:else}
	<button type="button" class="btn {variant} {size} {cls}" class:full {...rest}>
		{#if Icon}<Icon size={16} aria-hidden="true" />{/if}
		{@render children?.()}
		{#if IconRight}<IconRight size={16} aria-hidden="true" />{/if}
	</button>
{/if}

<style lang="scss">
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--sp-2);
		height: 36px;
		padding: 0 14px;
		border-radius: var(--r-md);
		border: 1px solid transparent;
		font-weight: 600;
		font-size: var(--fs-sm);
		text-decoration: none;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background var(--dur) var(--ease),
			border-color var(--dur) var(--ease),
			transform var(--dur) var(--ease);
		&:active:not(:disabled) {
			transform: translateY(1px);
		}
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
	.sm {
		height: 30px;
		padding: 0 10px;
		font-size: var(--fs-xs);
	}
	.full {
		width: 100%;
	}
	.primary {
		background: var(--c-primary);
		color: var(--c-primary-text);
		&:hover:not(:disabled) {
			background: #33374f;
		}
	}
	.gradient {
		background: var(--tpc-gradient);
		color: var(--tpc-ink);
		&:hover:not(:disabled) {
			filter: saturate(1.15);
		}
	}
	.secondary {
		background: var(--c-surface);
		border-color: var(--c-border-strong);
		color: var(--c-text);
		&:hover:not(:disabled) {
			background: var(--c-surface-2);
		}
	}
	.ghost {
		background: transparent;
		color: var(--c-text-muted);
		&:hover:not(:disabled) {
			background: var(--c-surface-2);
			color: var(--c-text);
		}
	}
	.danger {
		background: var(--c-surface);
		border-color: #f1c4c4;
		color: var(--deep-red);
		&:hover:not(:disabled) {
			background: var(--tint-red);
		}
	}
</style>
