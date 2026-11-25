<script lang="ts">
	import { Copy, ExternalLink, ShieldCheck } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { CAREER_SECTIONS, type CareerSection } from '$lib/config/career';
	import { toast } from '$lib/stores/toast.svelte';

	let { data } = $props();
	const sections = $derived(CAREER_SECTIONS.filter((s) => data.items.some((i) => i.section === s.key)));
	let active = $state<CareerSection | null>(null);
	const current = $derived(active ?? sections[0]?.key ?? null);
	const items = $derived(data.items.filter((i) => i.section === current));

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toast('Copied to clipboard', 'success');
		} catch {
			toast('Copy failed — select the text instead', 'error');
		}
	}
</script>

<svelte:head><title>Career Center · TPC Studio</title></svelte:head>

<PageHeader title="Career Center" subtitle="Turn your Product Project into interview stories, resume bullets, and a case study." />

<p class="private"><ShieldCheck size={16} aria-hidden="true" /> This account is shared, so keep personal resumes and interview notes outside Studio. Copy what you need into your own documents.</p>

{#if !sections.length}
	<EmptyState title="Career resources are coming soon" body="The Academics Committee will add frameworks, practice questions, and templates here." />
{:else}
	<div class="layout">
		<nav aria-label="Career sections">
			{#each sections as s (s.key)}
				<button class:on={current === s.key} aria-pressed={current === s.key} onclick={() => (active = s.key)}>
					{s.label}<span>{data.items.filter((i) => i.section === s.key).length}</span>
				</button>
			{/each}
		</nav>
		<div>
			<p class="blurb">{CAREER_SECTIONS.find((s) => s.key === current)?.blurb}</p>
			<ul class="items">
				{#each items as i (i.id)}
					<li>
						<div class="text">
							<strong>{i.title}</strong>
							{#if i.body}<p>{i.body}</p>{/if}
							{#if i.url}<a href={i.url} target="_blank" rel="noopener noreferrer">Open link <ExternalLink size={12} aria-hidden="true" /></a>{/if}
						</div>
						<button class="copy" onclick={() => copy(i.body ? `${i.title}\n\n${i.body}` : i.title)} aria-label="Copy “{i.title}”"><Copy size={15} /> Copy</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style lang="scss">
	.private {
		display: flex;
		gap: var(--sp-2);
		align-items: flex-start;
		padding: var(--sp-3) var(--sp-4);
		margin-bottom: var(--sp-5);
		border-radius: var(--r-md);
		background: var(--tint-lavender);
		font-size: var(--fs-sm);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 2px;
			color: var(--deep-lavender);
		}
	}
	.layout {
		display: grid;
		gap: var(--sp-5);
		@include up($bp-md) {
			grid-template-columns: 220px 1fr;
		}
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
		@include down($bp-md) {
			flex-direction: row;
			overflow-x: auto;
		}
		button {
			display: flex;
			justify-content: space-between;
			gap: var(--sp-2);
			padding: 8px 12px;
			border: 0;
			border-radius: var(--r-md);
			background: none;
			text-align: left;
			font-weight: 600;
			font-size: var(--fs-sm);
			color: var(--c-text-muted);
			cursor: pointer;
			white-space: nowrap;
			span {
				font-weight: 500;
				color: var(--c-text-faint);
			}
			&:hover {
				background: var(--c-surface-2);
			}
			&.on {
				background: var(--tint-blue);
				color: var(--tpc-ink);
			}
		}
	}
	.blurb {
		color: var(--c-text-muted);
		margin-bottom: var(--sp-3);
	}
	.items {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		li {
			@include card;
			display: flex;
			gap: var(--sp-3);
			align-items: flex-start;
			padding: var(--sp-4);
		}
	}
	.text {
		flex: 1;
		min-width: 0;
		p {
			white-space: pre-wrap;
			margin-top: 6px;
			font-size: var(--fs-sm);
			color: var(--c-text-muted);
		}
		a {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			margin-top: 6px;
			font-size: var(--fs-sm);
			font-weight: 600;
		}
	}
	.copy {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		padding: 4px 10px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-sm);
		background: var(--c-surface);
		font-size: var(--fs-xs);
		font-weight: 600;
		cursor: pointer;
		&:hover {
			background: var(--c-surface-2);
		}
	}
</style>
