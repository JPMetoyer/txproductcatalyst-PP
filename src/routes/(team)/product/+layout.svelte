<script lang="ts">
	import { page } from '$app/state';
	import { Download, GitBranch, Users } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SaveIndicator from '$lib/components/ui/SaveIndicator.svelte';
	import { PHASES } from '$lib/config/phases';
	import { sectionFor } from '$lib/config/product-schema';
	import { DEMO, getTeam } from '$lib/data';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { download, productToMarkdown } from '$lib/utils/export';

	let { children } = $props();
	const team = getTeam(DEMO.teamId)!;
	workspace.load(team.id);

	const name = $derived((workspace.value('ov.name') as string) || team.name);
	const current = $derived(page.params.phase ?? (page.url.pathname.endsWith('/decisions') ? 'decisions' : ''));

	function exportDoc() {
		if (!workspace.product) return;
		download(`${name.toLowerCase().replace(/\W+/g, '-')}-product-doc.md`, productToMarkdown(workspace.product, team.name));
		toast('Exported as Markdown', 'success');
	}

	// Prototype-only: demonstrates conflict detection without a second device.
	function simulate() {
		const phase = (page.params.phase ?? 'overview') as Parameters<typeof sectionFor>[0];
		const field = sectionFor(phase).groups.flatMap((g) => g.fields).find((f) => f.type === 'textarea')!;
		workspace.simulateTeammateEdit(field.key, 'Edited by a teammate on another laptop just now.');
		toast(`A teammate saved “${field.label}”. Edit that field to see conflict handling.`, 'info', 6000);
	}
</script>

<div class="head">
	<div>
		<span class="eyebrow">My Product</span>
		<h1>{name}</h1>
	</div>
	<div class="tools">
		<SaveIndicator state={workspace.overall} />
		<Button size="sm" variant="ghost" icon={Users} onclick={simulate} title="Prototype only">Simulate teammate edit</Button>
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

<p class="shared-note">Shared workspace — changes save automatically and are visible to your whole team and mentor.</p>

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
