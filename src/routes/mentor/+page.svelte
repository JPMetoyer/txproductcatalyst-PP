<script lang="ts">
	import { ArrowRight, TriangleAlert, ClipboardCheck } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import TeamCard from '$lib/components/product/TeamCard.svelte';
	import { fmtDate, relativeDays, timeAgo } from '$lib/utils/format';

	let { data } = $props();
	const now = new Date().toISOString();
	const firstName = $derived(data.displayName.split(' ')[0]);
</script>

<svelte:head><title>Mentor home · TPC Studio</title></svelte:head>

<PageHeader eyebrow="Mentor dashboard" title="Hi, {firstName}." subtitle="Reviews take about 15 minutes and use what teams have already written. No grading, no extra reports." />

<div class="stats">
	<div><strong>{data.teams.length}</strong><span>Assigned teams</span></div>
	<div class="hl"><strong>{data.ready.length}</strong><span>Ready for review</span></div>
	<div><strong>{data.blockers.length}</strong><span>Reported blockers</span></div>
	{#if data.nextMilestone}
		<div>
			<strong>{fmtDate(data.nextMilestone.targetDate, { month: 'short', day: 'numeric' })}</strong>
			<span>M{data.nextMilestone.number} target ({relativeDays(data.today, data.nextMilestone.targetDate)})</span>
		</div>
	{/if}
</div>

<div class="grid">
	<div class="col">
		<Card title="Ready for review" eyebrow="Teams waiting on you" tone="highlight" id="ready">
			{#if data.ready.length}
				<ul class="list">
					{#each data.ready as r (r.id)}
						<li>
							<ClipboardCheck size={18} aria-hidden="true" />
							<div class="grow">
								<strong>{r.teamName}</strong>
								<span>{r.milestone}{r.readyAt ? ` · marked ready ${timeAgo(r.readyAt, now)}` : ''}</span>
							</div>
							<Button size="sm" variant="primary" href="/mentor/teams/{r.teamId}?tab=review&milestone={r.milestoneId}" iconRight={ArrowRight}>Review</Button>
						</li>
					{/each}
				</ul>
			{:else}
				<EmptyState title="No teams waiting" body="Teams appear here when they mark a milestone ready." mascot={false} />
			{/if}
		</Card>

		<section>
			<h2 class="h">Your teams</h2>
			{#if data.teams.length}
				<div class="teams">
					{#each data.teams as t (t.id)}<TeamCard team={t} href="/mentor/teams/{t.id}" />{/each}
				</div>
			{:else}
				<EmptyState title="No teams assigned yet" body="The Academics Committee assigns teams to mentors." />
			{/if}
		</section>
	</div>

	<div class="col">
		<Card title="Reported blockers" id="blockers">
			{#if data.blockers.length}
				<ul class="list">
					{#each data.blockers as b (b.id)}
						<li class="warn">
							<TriangleAlert size={16} aria-hidden="true" />
							<div class="grow"><strong>{b.teamName}</strong><span>{b.text}</span></div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">No blockers reported.</p>
			{/if}
		</Card>

		<Card title="Your feedback history" id="history">
			{#if data.history.length}
				<ul class="list">
					{#each data.history as h (h.id)}
						<li>
							<div class="grow">
								<div class="row"><strong>{h.teamName}</strong><MilestoneStatusBadge status={h.status} /></div>
								<span>{h.milestone} · {timeAgo(h.at, now)}</span>
								{#if h.feedback}<p>{h.feedback}</p>{/if}
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">Reviews you record will appear here.</p>
			{/if}
		</Card>
	</div>
</div>

<style lang="scss">
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--sp-3);
		margin-bottom: var(--sp-5);
		@include up($bp-md) {
			grid-template-columns: repeat(4, 1fr);
		}
		div {
			@include card;
			padding: var(--sp-4);
			display: flex;
			flex-direction: column;
		}
		.hl {
			background: var(--tint-blue);
			border-color: transparent;
		}
		strong {
			font-family: var(--font-display);
			font-size: var(--fs-xl);
		}
		span {
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1.5fr 1fr;
		}
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		min-width: 0;
	}
	.h {
		font-size: var(--fs-md);
		margin-bottom: var(--sp-3);
	}
	.teams {
		display: grid;
		gap: var(--sp-3);
		@include up($bp-sm) {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		li {
			display: flex;
			align-items: center;
			gap: var(--sp-3);
			padding: var(--sp-3) 0;
			border-bottom: 1px solid var(--c-border);
			&:last-child {
				border-bottom: 0;
				padding-bottom: 0;
			}
			&:first-child {
				padding-top: 0;
			}
			&.warn :global(svg) {
				color: var(--deep-orange);
				align-self: flex-start;
				margin-top: 3px;
			}
		}
	}
	.grow {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		font-size: var(--fs-sm);
		span {
			color: var(--c-text-muted);
			font-size: var(--fs-xs);
		}
		p {
			margin-top: 4px;
		}
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: var(--sp-2);
	}
	.muted {
		color: var(--c-text-muted);
		font-size: var(--fs-sm);
	}
</style>
