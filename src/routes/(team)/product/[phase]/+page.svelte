<script lang="ts">
	import { ArrowLeft, ArrowRight, Calculator, FlaskConical, Flag, Lightbulb } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import FieldInput from '$lib/components/product/FieldInput.svelte';
	import LogTable from '$lib/components/product/LogTable.svelte';
	import { PHASES, phaseMeta } from '$lib/config/phases';
	import { sectionFor, sectionFill } from '$lib/config/product-schema';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate } from '$lib/utils/format';
	import type { MilestoneStatus } from '$lib/types/domain';

	let { data } = $props();
	const phase = $derived(data.phase);
	const meta = $derived(phaseMeta(phase));
	const section = $derived(sectionFor(phase));
	const lesson = $derived(data.lessons.find((l) => l.relatedPhase === phase));
	const milestone = $derived(data.milestones.find((m) => (m.relatedPhases as string[]).includes(phase)));

	let readiness = $state<Record<string, MilestoneStatus>>({});
	const status = $derived<MilestoneStatus>(
		milestone ? (readiness[milestone.id] ?? data.reviews.find((r) => r.milestoneId === milestone.id)?.status ?? 'upcoming') : 'upcoming'
	);
	let marking = $state(false);

	const fill = $derived(workspace.product ? sectionFill(phase, workspace.product.fields) : { filled: 0, total: 0 });
	const idx = $derived(PHASES.findIndex((p) => p.key === phase));
	const prev = $derived(PHASES[idx - 1]);
	const next = $derived(PHASES[idx + 1]);

	async function markReady() {
		if (!milestone) return;
		marking = true;
		const res = await fetch('/api/milestones/ready', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ milestoneId: milestone.id }) });
		marking = false;
		if (!res.ok) return toast((await res.json().catch(() => null))?.message ?? 'Could not mark ready', 'error');
		readiness[milestone.id] = 'ready';
		toast(`Marked ready for ${milestone.title}. It now shows on your mentor's dashboard.`, 'success');
	}
</script>

<svelte:head><title>{meta.label} · My Product · TPC Studio</title></svelte:head>

<div class="intro">
	<div>
		<h2>{meta.label} <span class="tagline">— {meta.tagline}</span></h2>
		<p>{section.intro}</p>
		<p class="fill">{fill.filled} of {fill.total} fields started · incomplete fields are fine</p>
	</div>
	{#if lesson}
		<a class="lesson" href="/academy">
			<Lightbulb size={16} aria-hidden="true" />
			<span>Learn it in <strong>GM{lesson.gmNumber} — {lesson.title}</strong></span>
		</a>
	{/if}
</div>

{#if milestone}
	<div class="milestone">
		<Flag size={18} aria-hidden="true" />
		<div class="ms-text">
			<strong>Milestone {milestone.number}: {milestone.title}</strong>
			<span>Reviews this section · target {fmtDate(milestone.targetDate)}</span>
		</div>
		<MilestoneStatusBadge {status} />
		{#if !workspace.readonly && (status === 'upcoming' || status === 'follow-up')}
			<Button size="sm" variant="primary" onclick={markReady} disabled={marking}>Mark ready for review</Button>
		{/if}
	</div>
{/if}

{#if phase === 'monetize' || phase === 'scope'}
	<div class="tool">
		{#if phase === 'monetize'}
			<Calculator size={18} aria-hidden="true" />
			<span><strong>Business Model Studio</strong> — model subscription, transaction, and licensing revenue against your costs.</span>
		{:else}
			<FlaskConical size={18} aria-hidden="true" />
			<span><strong>Feasibility Explorer</strong> — assess data, integrations, privacy, and complexity risks.</span>
		{/if}
		<span class="soon">Coming in Phase 4</span>
	</div>
{/if}

{#each section.groups as group (group.title)}
	<section class="group" aria-labelledby="g-{group.title}">
		<h3 id="g-{group.title}">{group.title}</h3>
		<div class="fields">
			{#each group.fields as def (def.key)}
				<FieldInput {def} readonly={workspace.readonly} />
			{/each}
		</div>
	</section>
{/each}

{#each section.tables ?? [] as t (t.kind)}
	<div class="group"><LogTable def={t} readonly={workspace.readonly} /></div>
{/each}

<nav class="pager" aria-label="Section navigation">
	{#if prev}<Button href="/product/{prev.key}" icon={ArrowLeft} variant="ghost">{prev.label}</Button>{:else}<span></span>{/if}
	{#if next}<Button href="/product/{next.key}" iconRight={ArrowRight}>{next.label}</Button>{:else}<Button href="/product/decisions" iconRight={ArrowRight}>Decision log</Button>{/if}
</nav>

<style lang="scss">
	.intro {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--sp-4);
		margin-bottom: var(--sp-4);
		h2 {
			font-size: var(--fs-lg);
		}
		p {
			color: var(--c-text-muted);
			max-width: 64ch;
			margin-top: 4px;
		}
	}
	.tagline {
		font-family: var(--font-body);
		font-weight: 500;
		color: var(--c-text-muted);
		font-size: var(--fs-md);
	}
	.fill {
		font-size: var(--fs-xs);
	}
	.lesson {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		padding: 8px 12px;
		border-radius: var(--r-md);
		background: var(--tint-blue);
		color: var(--deep-blue);
		font-size: var(--fs-sm);
		text-decoration: none;
		strong {
			color: var(--tpc-ink);
		}
		&:hover {
			text-decoration: underline;
		}
	}
	.milestone,
	.tool {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-3);
		padding: var(--sp-3) var(--sp-4);
		border-radius: var(--r-md);
		margin-bottom: var(--sp-4);
		font-size: var(--fs-sm);
	}
	.milestone {
		background:
			linear-gradient(var(--c-surface), var(--c-surface)) padding-box,
			var(--tpc-gradient) border-box;
		border: 1.5px solid transparent;
	}
	.ms-text {
		flex: 1;
		min-width: 200px;
		display: flex;
		flex-direction: column;
		span {
			color: var(--c-text-muted);
			font-size: var(--fs-xs);
		}
	}
	.tool {
		background: var(--c-surface);
		border: 1px dashed var(--c-border-strong);
		span:nth-child(2) {
			flex: 1;
			min-width: 200px;
		}
	}
	.soon {
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--c-text-faint);
	}
	.group {
		@include card;
		padding: var(--sp-5);
		margin-bottom: var(--sp-4);
		h3 {
			font-size: var(--fs-md);
			margin-bottom: var(--sp-4);
		}
	}
	.fields {
		display: grid;
		gap: var(--sp-5) var(--sp-5);
		@include up($bp-md) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.pager {
		display: flex;
		justify-content: space-between;
		margin-top: var(--sp-5);
	}
</style>
