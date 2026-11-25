<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { ArrowLeft, MessageCircleQuestion, Flag } from '@lucide/svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import FieldInput from '$lib/components/product/FieldInput.svelte';
	import LogTable from '$lib/components/product/LogTable.svelte';
	import DecisionLog from '$lib/components/product/DecisionLog.svelte';
	import JourneyStrip from '$lib/components/product/JourneyStrip.svelte';
	import { JOURNEY, PHASES, phaseMeta } from '$lib/config/phases';
	import { sectionFor } from '$lib/config/product-schema';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate, timeAgo } from '$lib/utils/format';
	import type { MilestoneStatus, PhaseKey } from '$lib/types/domain';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	const team = $derived(data.team);
	// Mentors read documentation and can start comment threads, but never edit fields.
	$effect.pre(() => workspace.init(data.product, data.comments, { readonly: true, canStartThreads: true, canComment: true, force: true }));

	const tabs = ['overview', 'docs', 'decisions', 'review'] as const;
	type Tab = (typeof tabs)[number];
	const tabLabels: Record<Tab, string> = { overview: 'Overview', docs: 'Documentation', decisions: 'Decision log', review: 'Milestone review' };
	const tab = $derived((page.url.searchParams.get('tab') as Tab) ?? 'overview');
	const setTab = (t: Tab) => goto(`?tab=${t}`, { replaceState: true, noScroll: true, keepFocus: true });

	let docPhase = $state<PhaseKey>('overview');
	const reviewOf = (id: string) => data.reviews.find((r) => r.milestoneId === id);
	const defaultMs = $derived(data.milestones.find((m) => m.targetDate >= data.today) ?? data.milestones.at(-1));
	let msId = $state('');
	$effect.pre(() => {
		// ?milestone=<id> (from the dashboard's Review button) wins; otherwise a ready one, then the next by date.
		const wanted = page.url.searchParams.get('milestone');
		const ready = data.reviews.find((r) => r.status === 'ready')?.milestoneId;
		if (!msId) msId = (data.milestones.find((m) => m.id === wanted) ?? data.milestones.find((m) => m.id === ready) ?? defaultMs)?.id ?? '';
	});
	const ms = $derived(data.milestones.find((m) => m.id === msId));
	const existing = $derived(ms ? reviewOf(ms.id) : undefined);
	let outcome = $state<MilestoneStatus>('reviewed');

	const openFlags = $derived(data.flags.filter((f) => !f.clearedAt));
	let flagging = $state(false);
	let busy = $state(false);

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			busy = false;
			if (result.type === 'success') flagging = false;
		};
	};
</script>

<svelte:head><title>{team.name} · Mentor · TPC Studio</title></svelte:head>

<a class="back" href="/mentor/teams"><ArrowLeft size={16} aria-hidden="true" /> Assigned teams</a>

<header class="head">
	<div>
		<h1>{team.name}</h1>
		<p>{team.challengeTitle ?? 'No challenge'} · currently in <strong>{phaseMeta(team.currentPhase).label}</strong></p>
	</div>
	<div class="right">
		<div class="roster" aria-label="Team roster">
			{#each team.roster as m (m.id)}<Avatar name={m.name} size={32} />{/each}
		</div>
		<Button size="sm" variant="danger" icon={Flag} onclick={() => (flagging = true)}>Flag for Academics</Button>
	</div>
</header>

{#if openFlags.length}
	<div class="flagged" role="status">
		<Flag size={16} aria-hidden="true" />
		<div>
			{#each openFlags as f (f.id)}
				<p><strong>Flagged {fmtDate(f.createdAt.slice(0, 10))} by {f.flaggedBy}:</strong> {f.reason}</p>
			{/each}
			<span>Waiting for the Academics Committee to follow up.</span>
		</div>
	</div>
{/if}

<div class="tabs" role="tablist" aria-label="Team views">
	{#each tabs as t}
		<button role="tab" aria-selected={tab === t} class:on={tab === t} onclick={() => setTab(t)}>{tabLabels[t]}</button>
	{/each}
</div>

{#if tab === 'overview'}
	<div class="grid">
		<Card title="Journey">
			<JourneyStrip current={team.currentPhase} started={JOURNEY.slice(0, JOURNEY.indexOf(team.currentPhase) + 1)} />
			<form method="POST" action="?/phase" use:enhance={submit} class="phase-form">
				<label for="phase">Team's actual phase</label>
				<select id="phase" name="phase" value={team.currentPhase} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
					{#each JOURNEY as p}<option value={p}>{phaseMeta(p).label}</option>{/each}
				</select>
				<span class="hint">Calendar suggests <strong>{phaseMeta(team.recommendedPhase).label}</strong>. Teams can edit every phase either way.</span>
			</form>
		</Card>
		<Card title="Milestone history">
			<ul class="ms">
				{#each data.milestones as m (m.id)}
					<li>
						<span>M{m.number} · {m.title}</span>
						<MilestoneStatusBadge status={reviewOf(m.id)?.status ?? 'upcoming'} />
					</li>
				{/each}
			</ul>
		</Card>
		<Card title="Roster">
			<ul class="people">{#each team.roster as m (m.id)}<li><Avatar name={m.name} size={26} /> {m.name}</li>{/each}</ul>
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
		<p class="ro-note">Read-only. Use <strong>Comment</strong> under any field to leave a note; the team can reply and resolve it.</p>
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
{:else if ms}
	<div class="review">
		{#key ms.id}
			<form class="form" method="POST" action="?/review" use:enhance={submit}>
				<div class="ms-pick">
					<label for="ms">Milestone</label>
					<select id="ms" name="milestoneId" bind:value={msId}>
						{#each data.milestones as m (m.id)}<option value={m.id}>M{m.number} — {m.title} ({m.afterGm})</option>{/each}
					</select>
					<MilestoneStatusBadge status={existing?.status ?? 'upcoming'} />
				</div>
				<p class="sep-note">Milestone feedback is separate from field comments. The team sees it on their Home page.</p>
				<label><span>Feedback</span><textarea name="feedback" rows="4" placeholder="What's strong? What needs more evidence?" maxlength="5000">{existing?.feedback ?? ''}</textarea></label>
				<label><span>Recommended next steps</span><textarea name="nextSteps" rows="3" maxlength="5000">{existing?.nextSteps ?? ''}</textarea></label>
				<label><span>Blockers</span><textarea name="blockers" rows="2" placeholder="Anything the team is stuck on" maxlength="2000">{existing?.blockers ?? ''}</textarea></label>
				<div class="row">
					<label>
						<span>Outcome</span>
						<select name="status" bind:value={outcome}>
							<option value="reviewed">Reviewed</option>
							<option value="follow-up">Follow-up needed</option>
						</select>
					</label>
					<label><span>Review date</span><input type="date" name="reviewedOn" value={existing?.reviewedAt?.slice(0, 10) ?? data.today} /></label>
				</div>
				<div class="actions">
					<Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save review'}</Button>
				</div>
			</form>
		{/key}

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
						<button
							class="linkish"
							onclick={() => {
								docPhase = p;
								setTab('docs');
							}}>{phaseMeta(p).label} →</button
						>
					{/each}
				</div>
				{#if ms.targetDate}<p class="target">Target: {fmtDate(ms.targetDate)}</p>{/if}
			</Card>
		</aside>
	</div>
{:else}
	<EmptyState title="No milestones configured" body="The Academics Committee sets milestones in Admin → Milestones." />
{/if}

<Modal open={flagging} title="Flag {team.name} for Academics" onclose={() => (flagging = false)}>
	<form id="flag-form" method="POST" action="?/flag" use:enhance={submit} class="form plain">
		<label>
			<span>Why does this team need support? *</span>
			<textarea name="reason" rows="3" required minlength="3" maxlength="1000" placeholder="e.g. Two members stopped attending; the team can't recruit interviewees."></textarea>
		</label>
		<p class="muted">The Academics Committee sees this on their dashboard with your name and today's date. They clear it once handled.</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (flagging = false)}>Cancel</Button>
		<Button variant="danger" type="submit" form="flag-form" disabled={busy}>Flag team</Button>
	{/snippet}
</Modal>

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
	.right {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		flex-wrap: wrap;
	}
	.roster {
		display: flex;
		:global(.av + .av) {
			margin-left: -8px;
		}
	}
	.flagged {
		display: flex;
		gap: var(--sp-2);
		padding: var(--sp-3) var(--sp-4);
		margin-bottom: var(--sp-4);
		border-radius: var(--r-md);
		background: var(--tint-red);
		color: var(--deep-red);
		font-size: var(--fs-sm);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
		}
		p {
			color: var(--tpc-ink);
		}
		span {
			font-size: var(--fs-xs);
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
	.ro-note,
	.sep-note {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		margin-bottom: var(--sp-3);
	}
	.sep-note {
		margin: calc(var(--sp-2) * -1) 0 0;
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.phase-form {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
		margin-top: var(--sp-4);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
		font-size: var(--fs-sm);
		label {
			font-weight: 600;
		}
		select {
			padding: 5px 8px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-sm);
		}
		.hint {
			flex-basis: 100%;
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
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
		&.plain {
			border: 0;
			padding: 0;
		}
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
	.target,
	.muted {
		margin-top: var(--sp-4);
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
</style>
