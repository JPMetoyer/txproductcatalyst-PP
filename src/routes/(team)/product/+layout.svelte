<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { Download, GitBranch } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SaveIndicator from '$lib/components/ui/SaveIndicator.svelte';
	import { PHASES } from '$lib/config/phases';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { download, productToMarkdown } from '$lib/utils/export';

	let { data, children } = $props();
	const teamName = $derived(data.ctx!.team.name);

	// Initialize from server data (no-op when staying on the same product, so edits survive tab switches).
	$effect.pre(() => workspace.init(data.product, data.comments, { readonly: data.archived }));

	const name = $derived((workspace.value('ov.name') as string) || teamName);
	const current = $derived(page.params.phase ?? (page.url.pathname.endsWith('/decisions') ? 'decisions' : ''));

	// Warn before leaving with unsaved edits (closing the tab, or leaving the workspace).
	$effect(() => {
		const warn = (e: BeforeUnloadEvent) => {
			if (workspace.dirty) e.preventDefault();
		};
		addEventListener('beforeunload', warn);
		return () => removeEventListener('beforeunload', warn);
	});
	beforeNavigate((nav) => {
		const leaving = !nav.to?.url.pathname.startsWith('/product');
		if (leaving && workspace.dirty && !confirm('Some changes are still saving. Leave anyway?')) nav.cancel();
	});

	function exportDoc() {
		if (!workspace.product) return;
		download(`${name.toLowerCase().replace(/\W+/g, '-')}-product-doc.md`, productToMarkdown(workspace.product, teamName));
		toast('Exported as Markdown', 'success');
	}
</script>

<div class="head">
	<div>
		<span class="eyebrow">My Product</span>
		<h1>{name}</h1>
	</div>
	<div class="tools">
		<SaveIndicator state={workspace.overall} />
		<Button size="sm" icon={Download} onclick={exportDoc}>Export</Button>
	</div>
</div>

<nav class="tabs" aria-label="Product sections">
	{#each PHASES as p (p.key)}
		<a href="/product/{p.key}" class:active={current === p.key} aria-current={current === p.key ? 'page' : undefined}>{p.label}</a>
	{/each}
	<span class="sep" aria-hidden="true"></span>
	<a href="/product/decisions" class:active={current === 'decisions'} aria-current={current === 'decisions' ? 'page' : undefined}>
		<GitBranch size={14} aria-hidden="true" /> Decision log
	</a>
</nav>

{#if data.archived}
	<p class="shared-note">This semester is archived — documentation is read-only.</p>
{:else}
	<p class="shared-note">Shared workspace — changes save automatically and are visible to your whole team and mentor.</p>
{/if}

{@render children()}

<style lang="scss">
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--sp-3);
		margin-bottom: var(--sp-4);
	}
	.eyebrow {
		@include eyebrow;
	}
	h1 {
		font-size: var(--fs-xl);
		@include up($bp-md) {
			font-size: var(--fs-2xl);
		}
	}
	.tools {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}
	.tabs {
		position: sticky;
		top: 52px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		border-radius: var(--r-md);
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		overflow-x: auto;
		scrollbar-width: none;
		@include up($bp-md) {
			top: var(--sp-3);
		}
		a {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 6px 12px;
			border-radius: var(--r-sm);
			font-size: var(--fs-sm);
			font-weight: 600;
			color: var(--c-text-muted);
			text-decoration: none;
			white-space: nowrap;
			&:hover {
				background: var(--c-surface-2);
				color: var(--c-text);
			}
			&.active {
				background: var(--tpc-ink);
				color: #fff;
			}
		}
	}
	.sep {
		width: 1px;
		height: 20px;
		background: var(--c-border);
		margin: 0 4px;
		flex-shrink: 0;
	}
	.shared-note {
		font-size: var(--fs-xs);
		color: var(--c-text-faint);
		margin: var(--sp-2) 0 var(--sp-5);
	}
</style>
