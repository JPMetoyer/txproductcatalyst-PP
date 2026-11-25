<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ArrowLeft, MessageCircleQuestion } from '@lucide/svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import FieldInput from '$lib/components/product/FieldInput.svelte';
	import LogTable from '$lib/components/product/LogTable.svelte';
	import DecisionLog from '$lib/components/product/DecisionLog.svelte';
	import JourneyStrip from '$lib/components/product/JourneyStrip.svelte';
	import { PHASES, phaseMeta } from '$lib/config/phases';
	import { sectionFor } from '$lib/config/product-schema';
	import * as data from '$lib/data';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate } from '$lib/utils/format';
	import type { MilestoneStatus, PhaseKey } from '$lib/types/domain';

	let { data: pd } = $props();
	const team = $derived(pd.team);
	// Phase 3: replace mock data with a server load (RLS already limits mentors to assigned teams).
	$effect.pre(() => workspace.init(data.getProduct(team.id) ?? null, data.getFieldComments(data.getProduct(team.id)?.id ?? ''), { readonly: true }));

	const tabs = ['overview', 'docs', 'decisions', 'review'] as const;
	type Tab = (typeof tabs)[number];
	const tabLabels: Record<Tab, string> = { overview: 'Overview', docs: 'Documentation', decisions: 'Decision log', review: 'Milestone review' };
	const tab = $derived((page.url.searchParams.get('tab') as Tab) ?? 'overview');
	const setTab = (t: Tab) => goto(`?tab=${t}`, { replaceState: true, noScroll: true, keepFocus: true });

	const challenge = $derived(data.getChallenge(team.challengeId ?? ''));
	const roster = $derived(data.getRoster(team.id));
	const milestones = data.getMilestones();
	let docPhase = $state<PhaseKey>('overview');

	// Review form (Prototype: local only. Phase 3: form action → milestone_reviews).
	const nextMs = data.getNextMilestone();
	let msId = $state(nextMs.id);
	const ms = $derived(milestones.find((m) => m.id === msId)!);
	const existing = $derived(data.getReview(team.id, msId));
	let feedback = $state('');
	let nextSteps = $state('');
	let blockers = $state('');
	let status = $state<MilestoneStatus>('reviewed');
	let reviewDate = $state(data.today());
	$effect(() => {
		feedback = existing?.feedback ?? '';
		nextSteps = existing?.nextSteps ?? '';
		blockers = existing?.blockers ?? '';
	});

	function saveReview(e: SubmitEvent) {
		e.preventDefault();
		toast(`Review saved for ${team.name} — ${ms.title}`, 'success');
	}
	function flag() {
		toast('Flagged for the Academics Committee', 'info');
	}
</script>

<svelte:head><title>{team.name} · Mentor · TPC Studio</title></svelte:head>

<a class="back" href="/mentor/teams"><ArrowLeft size={16} aria-hidden="true" /> Assigned teams</a>

<header class="head">
	<div>
		<h1>{team.name}</h1>
		<p>{challenge?.title ?? 'No challenge'} · currently in <strong>{phaseMeta(team.currentPhase).label}</strong></p>
	</div>
	<div class="roster" aria-label="Team roster">
		{#each roster as m (m.id)}<Avatar name={m.name} size={32} />{/each}
	</div>
</header>

<div class="tabs" role="tablist" aria-label="Team views">
	{#each tabs as t}
		<button role="tab" aria-selected={tab === t} class:on={tab === t} onclick={() => setTab(t)}>{tabLabels[t]}</button>
	{/each}
</div>

{#if tab === 'overview'}
	<div class="grid">
		<Card title="Journey">
			<JourneyStrip current={team.currentPhase} started={team.phasesStarted} />
		</Card>
		<Card title="Milestone history">
			<ul class="ms">
				{#each milestones as m (m.id)}
					{@const r = data.getReview(team.id, m.id)}
					<li>
						<span>M{m.number} · {m.title}</span>
						<MilestoneStatusBadge status={r?.status ?? 'upcoming'} />
					</li>
				{/each}
			</ul>
		</Card>
		<Card title="Roster">
			<ul class="people">{#each roster as m (m.id)}<li><Avatar name={m.name} size={26} /> {m.name}</li>{/each}</ul>
		</Card>
		<Card title="Product overview">
			{#if workspace.product}
				<div class="ro-fields">
					{#each sectionFor('overview').groups[0].fields as def (def.key)}<FieldInput {def} readonly />{/each}
				</div>
			{:else}
				<EmptyState title="No documentation yet" body="This team hasn't started their product workspace." mascot={false} />
			{/if}
		</Card>
	</div>
{:else if tab === 'docs'}
	{#if workspace.product}
		<div class="phase-pick" role="group" aria-label="Section">
			{#each PHASES as p (p.key)}
				<button class:on={docPhase === p.key} aria-pressed={docPhase === p.key} onclick={() => (docPhase = p.key)}>{p.label}</button>
			{/each}
		</div>
		<p class="ro-note">Read-only — mentors can comment during reviews but can't edit team documentation.</p>
		{#each sectionFor(docPhase).groups as g (g.title)}
			<section class="group">
				<h3>{g.title}</h3>
				<div class="ro-fields">{#each g.fields as def (def.key)}<FieldInput {def} readonly />{/each}</div>
			</section>
		{/each}
		{#each sectionFor(docPhase).tables ?? [] as t (t.kind)}
			<section class="group"><LogTable def={t} readonly /></section>
		{/each}
	{:else}
		<EmptyState title="No documentation yet" body="This team hasn't started their product workspace." />
	{/if}
{:else if tab === 'decisions'}
	<DecisionLog decisions={workspace.product?.decisions ?? []} />
{:else}
	<div class="review">
		<form class="form" onsubmit={saveReview}>
			<div class="ms-pick">
				<label for="ms">Milestone</label>
				<select id="ms" bind:value={msId}>
					{#each milestones as m (m.id)}<option value={m.id}>M{m.number} — {m.title} ({m.afterGm})</option>{/each}
				</select>
				{#if existing}<MilestoneStatusBadge status={existing.status} />{/if}
			</div>

			<label><span>Feedback</span><textarea rows="4" bind:value={feedback} placeholder="What's strong? What needs more evidence?"></textarea></label>
			<label><span>Recommended next steps</span><textarea rows="3" bind:value={nextSteps}></textarea></label>
			<label><span>Blockers</span><textarea rows="2" bind:value={blockers} placeholder="Anything the team is stuck on"></textarea></label>
			<div class="row">
				<label>
					<span>Outcome</span>
					<select bind:value={status}>
						<option value="reviewed">Reviewed</option>
						<option value="follow-up">Follow-up needed</option>
					</select>
				</label>
				<label><span>Review date</span><input type="date" bind:value={reviewDate} /></label>
			</div>
			<div class="actions">
				<Button variant="ghost" onclick={flag}>Flag for Academics</Button>
				<Button variant="primary" type="submit">Save review</Button>
			</div>
		</form>

		<aside>
			<Card title="Discussion guide" eyebrow="~10–15 minutes">
				<ol class="qs">
					{#each ms.reviewQuestions as q}<li><MessageCircleQuestion size={16} aria-hidden="true" /> {q}</li>{/each}
				</ol>
				<p class="lbl">Review areas</p>
				<div class="chips">{#each ms.reviewAreas as a}<Badge>{a}</Badge>{/each}</div>
				<p class="lbl">Relevant documentation</p>
				<div class="chips">
					{#each ms.relatedPhases as p}
						<button class="linkish" onclick={() => { docPhase = p; setTab('docs'); }}>{phaseMeta(p).label} →</button>
					{/each}
				</div>
				<p class="target">Target: {fmtDate(ms.targetDate)}</p>
			</Card>
		</aside>
	</div>
{/if}

<style lang="scss">
	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-text-muted);
		text-decoration: none;
		margin-bottom: var(--sp-3);
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--sp-3);
		margin-bottom: var(--sp-4);
		h1 {
			font-size: var(--fs-2xl);
		}
		p {
			color: var(--c-text-muted);
		}
	}
	.roster {
		display: flex;
		:global(.av + .av) {
			margin-left: -8px;
		}
	}
	.tabs,
	.phase-pick {
		display: flex;
		gap: 2px;
		overflow-x: auto;
		margin-bottom: var(--sp-4);
		border-bottom: 1px solid var(--c-border);
		button {
			border: 0;
			background: none;
			padding: 8px 14px;
			font-weight: 600;
			font-size: var(--fs-sm);
			color: var(--c-text-muted);
			border-bottom: 2px solid transparent;
			margin-bottom: -1px;
			cursor: pointer;
			white-space: nowrap;
			&.on {
				color: var(--c-text);
				border-color: var(--tpc-pink);
			}
		}
	}
	.phase-pick {
		border: 0;
		gap: 6px;
		flex-wrap: wrap;
		button {
			border: 1px solid var(--c-border-strong);
			border-radius: 999px;
			padding: 4px 12px;
			margin: 0;
			&.on {
				background: var(--tpc-ink);
				color: #fff;
				border-color: var(--tpc-ink);
			}
		}
	}
	.ro-note {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		margin-bottom: var(--sp-3);
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.ms,
	.people {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		li {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--sp-2);
			font-size: var(--fs-sm);
		}
	}
	.people li {
		justify-content: flex-start;
	}
	.ro-fields {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-md) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.group {
		@include card;
		padding: var(--sp-5);
		margin-bottom: var(--sp-4);
		h3 {
			font-size: var(--fs-md);
			margin-bottom: var(--sp-3);
		}
	}
	.review {
		display: grid;
		gap: var(--sp-5);
		@include up($bp-lg) {
			grid-template-columns: 1fr 340px;
		}
	}
	.form {
		@include card;
		padding: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			flex: 1;
			span {
				font-weight: 600;
				font-size: var(--fs-sm);
			}
		}
		textarea,
		select,
		input {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			field-sizing: content;
			min-height: 38px;
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
	}
	.ms-pick {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
		label {
			flex: 0 !important;
			font-weight: 600;
			font-size: var(--fs-sm);
		}
		select {
			flex: 1;
			min-width: 200px;
		}
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-3);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--sp-2);
	}
	.qs {
		list-style: none;
		margin: 0 0 var(--sp-4);
		padding: 0;
		display: grid;
		gap: var(--sp-3);
		li {
			display: flex;
			gap: var(--sp-2);
			font-size: var(--fs-sm);
			:global(svg) {
				flex-shrink: 0;
				margin-top: 3px;
				color: var(--deep-pink);
			}
		}
	}
	.lbl {
		@include eyebrow;
		margin: var(--sp-3) 0 6px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.linkish {
		border: 0;
		background: var(--tint-blue);
		color: var(--deep-blue);
		padding: 3px 10px;
		border-radius: 999px;
		font-weight: 600;
		font-size: var(--fs-xs);
		cursor: pointer;
	}
	.target {
		margin-top: var(--sp-4);
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
</style>
