<script lang="ts" module>
	import type { Component } from 'svelte';
	export interface NavItem {
		href: string;
		label: string;
		icon: Component<any>;
		/** Match nested routes (default true except for exact root items). */
		exact?: boolean;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { Menu, X, Settings, LogOut } from '@lucide/svelte';
	import Toaster from '$lib/components/ui/Toaster.svelte';
	import PrototypeBar from './PrototypeBar.svelte';

	interface Props {
		nav: NavItem[];
		workspaceName: string;
		workspaceSub: string;
		roleLabel: string;
		settingsHref?: string;
		children: Snippet;
	}
	let { nav, workspaceName, workspaceSub, roleLabel, settingsHref, children }: Props = $props();
	let open = $state(false);

	const isActive = (item: NavItem) =>
		item.exact ? page.url.pathname === item.href : page.url.pathname === item.href || page.url.pathname.startsWith(item.href + '/');

	// Close the mobile drawer after navigating.
	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

<a class="skip" href="#main">Skip to content</a>

<div class="shell">
	<header class="topbar">
		<button class="icon-btn" onclick={() => (open = true)} aria-label="Open navigation" aria-expanded={open}>
			<Menu size={20} />
		</button>
		<span class="brand-sm"><img src="/tpc.png" alt="" width="22" height="22" /> TPC Studio</span>
	</header>

	{#if open}
		<button class="scrim" aria-label="Close navigation" onclick={() => (open = false)}></button>
	{/if}

	<nav class="sidebar" class:open aria-label="Main">
		<div class="brand">
			<img src="/tpc.png" alt="" width="28" height="28" />
			<div>
				<strong>TPC Studio</strong>
				<span>{roleLabel}</span>
			</div>
			<button class="icon-btn close" onclick={() => (open = false)} aria-label="Close navigation"><X size={18} /></button>
		</div>

		<div class="workspace">
			<span class="ws-name">{workspaceName}</span>
			<span class="ws-sub">{workspaceSub}</span>
		</div>

		<ul>
			{#each nav as item (item.href)}
				{@const Icon = item.icon}
				<li>
					<a href={item.href} class:active={isActive(item)} aria-current={isActive(item) ? 'page' : undefined}>
						<Icon size={18} aria-hidden="true" />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="foot">
			{#if settingsHref}
				<a href={settingsHref} class:active={page.url.pathname === settingsHref}><Settings size={18} aria-hidden="true" /> Settings</a>
			{/if}
			<a href="/login"><LogOut size={18} aria-hidden="true" /> Log out</a>
		</div>
	</nav>

	<main id="main" tabindex="-1">
		<div class="content">
			{@render children()}
		</div>
	</main>
</div>

<Toaster />
<PrototypeBar />

<style lang="scss">
	.skip {
		position: absolute;
		left: -9999px;
		&:focus {
			left: var(--sp-4);
			top: var(--sp-4);
			z-index: 200;
			background: var(--c-surface);
			padding: var(--sp-2) var(--sp-3);
			border-radius: var(--r-sm);
		}
	}
	.shell {
		min-height: 100vh;
		@include up($bp-md) {
			display: grid;
			grid-template-columns: $sidebar-w 1fr;
		}
	}
	.topbar {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		height: 52px;
		padding: 0 var(--sp-3);
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--c-border);
		@include up($bp-md) {
			display: none;
		}
	}
	.brand-sm {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-family: var(--font-display);
		font-weight: 700;
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: var(--r-md);
		background: none;
		cursor: pointer;
		color: var(--c-text);
		&:hover {
			background: var(--c-surface-2);
		}
	}
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 39;
		border: 0;
		background: rgba(32, 35, 55, 0.35);
		@include up($bp-md) {
			display: none;
		}
	}
	.sidebar {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 40;
		width: min($sidebar-w + 24px, 86vw);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		padding: var(--sp-4) var(--sp-3);
		background: var(--c-surface);
		border-right: 1px solid var(--c-border);
		transform: translateX(-100%);
		transition: transform 220ms var(--ease);
		overflow-y: auto;
		&.open {
			transform: none;
			box-shadow: var(--shadow-lg);
		}
		@include up($bp-md) {
			position: sticky;
			top: 0;
			height: 100vh;
			width: auto;
			transform: none;
		}
	}
	.brand {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		padding: 0 var(--sp-2);
		strong {
			display: block;
			font-family: var(--font-display);
			font-size: var(--fs-md);
			line-height: 1.1;
		}
		span {
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
		.close {
			margin-left: auto;
			@include up($bp-md) {
				display: none;
			}
		}
	}
	.workspace {
		display: flex;
		flex-direction: column;
		padding: var(--sp-3);
		border-radius: var(--r-md);
		background:
			linear-gradient(var(--c-bg), var(--c-bg)) padding-box,
			var(--tpc-gradient) border-box;
		border: 1px solid transparent;
	}
	.ws-name {
		font-weight: 700;
		@include truncate;
	}
	.ws-sub {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	a {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		padding: 8px var(--sp-3);
		border-radius: var(--r-md);
		color: var(--c-text-muted);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--fs-sm);
		transition: background var(--dur) var(--ease);
		&:hover {
			background: var(--c-surface-2);
			color: var(--c-text);
		}
		&.active {
			background: var(--tint-blue);
			color: var(--tpc-ink);
			font-weight: 600;
			:global(svg) {
				color: var(--deep-blue);
			}
		}
	}
	.foot {
		margin-top: auto;
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	main {
		min-width: 0;
		outline: none;
	}
	.content {
		max-width: 1180px;
		margin: 0 auto;
		padding: var(--sp-5) var(--sp-4) 96px;
		@include up($bp-md) {
			padding: var(--sp-6) var(--sp-6) 96px;
		}
	}
</style>
