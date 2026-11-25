<script lang="ts">
	import { Pencil } from '@lucide/svelte';
	import Badge, { type Tone } from '$lib/components/ui/Badge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import { fmtDate } from '$lib/utils/format';
	import type { Decision, DecisionStatus } from '$lib/types/domain';

	let { decisions, onedit }: { decisions: Decision[]; onedit?: (d: Decision) => void } = $props();

	const STATUS: Record<DecisionStatus, [string, Tone]> = {
		proposed: ['Proposed', 'blue'],
		accepted: ['Accepted', 'green'],
		reconsidering: ['Reconsidering', 'orange'],
		reversed: ['Reversed', 'red']
	};
	let filter = $state<DecisionStatus | 'all'>('all');
	const list = $derived(decisions.filter((d) => filter === 'all' || d.status === filter).sort((a, b) => b.date.localeCompare(a.date)));
</script>

<div class="filters" role="group" aria-label="Filter decisions by status">
	{#each ['all', 'proposed', 'accepted', 'reconsidering', 'reversed'] as const as f}
		<button class:on={filter === f} aria-pressed={filter === f} onclick={() => (filter = f)}>
			{f === 'all' ? 'All' : STATUS[f][0]}
			<span>{f === 'all' ? decisions.length : decisions.filter((d) => d.status === f).length}</span>
		</button>
	{/each}
</div>

{#if list.length === 0}
	<EmptyState title="No decisions here yet" body="Log the moments your product changed direction — they become your best Demo Day and interview stories." />
{:else}
	<ol class="timeline">
		{#each list as d (d.id)}
			<li>
				<article>
					<header>
						<div>
							<h3>{d.title}</h3>
							<p class="meta">{fmtDate(d.date)} · {phaseMeta(d.phase).label}{d.attribution ? ` · ${d.attribution}` : ''}</p>
						</div>
						<div class="right">
							<Badge tone={STATUS[d.status][1]} dot>{STATUS[d.status][0]}</Badge>
							{#if onedit}<button class="icon" onclick={() => onedit(d)} aria-label="Edit decision “{d.title}”"><Pencil size={14} /></button>{/if}
						</div>
					</header>
					<p>{d.description}</p>
					<dl>
						{#if d.alternatives}<div><dt>Alternatives considered</dt><dd>{d.alternatives}</dd></div>{/if}
						{#if d.evidence}<div><dt>Evidence</dt><dd>{d.evidence}</dd></div>{/if}
						{#if d.reasoning}<div><dt>Reasoning</dt><dd>{d.reasoning}</dd></div>{/if}
					</dl>
				</article>
			</li>
		{/each}
	</ol>
{/if}

<style lang="scss">
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: var(--sp-4);
		button {
			display: inline-flex;
			gap: 6px;
			align-items: center;
			padding: 5px 12px;
			border-radius: 999px;
			border: 1px solid var(--c-border-strong);
			background: var(--c-surface);
			font-size: var(--fs-sm);
			font-weight: 600;
			cursor: pointer;
			span {
				font-size: var(--fs-xs);
				color: var(--c-text-faint);
			}
			&.on {
				background: var(--tpc-ink);
				color: #fff;
				border-color: var(--tpc-ink);
				span {
					color: #c9cbe0;
				}
			}
		}
	}
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0 0 0 20px;
		border-left: 2px solid var(--c-border);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		li {
			position: relative;
			&::before {
				content: '';
				position: absolute;
				left: -27px;
				top: 20px;
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background: var(--c-surface);
				border: 3px solid var(--tpc-lavender);
			}
		}
	}
	article {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		> p {
			margin: var(--sp-2) 0;
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		gap: var(--sp-3);
		align-items: flex-start;
	}
	h3 {
		font-size: var(--fs-md);
	}
	.meta {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.right {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	dl {
		margin: 0;
		display: grid;
		gap: var(--sp-3);
		font-size: var(--fs-sm);
		@include up($bp-md) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		dt {
			@include eyebrow;
			font-size: 11px;
		}
		dd {
			margin: 2px 0 0;
		}
	}
	.icon {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 0;
		background: none;
		border-radius: var(--r-sm);
		color: var(--c-text-muted);
		cursor: pointer;
		&:hover {
			background: var(--c-surface-2);
		}
	}
</style>
