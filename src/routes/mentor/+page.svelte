<script lang="ts">
	import { ArrowRight, TriangleAlert, ClipboardCheck } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import TeamCard from '$lib/components/product/TeamCard.svelte';
	import * as data from '$lib/data';
	import { fmtDate, relativeDays, timeAgo } from '$lib/utils/format';

	const today = data.today();
	const mentor = data.getMentor(data.DEMO.mentorId)!;
	const teams = data.teamsForMentor(mentor.id);
	const ms = data.getNextMilestone();
	const reviews = teams.flatMap((t) => data.getReviews(t.id).map((r) => ({ ...r, team: t })));
	const ready = reviews.filter((r) => r.status === 'ready');
	const blockers = reviews.filter((r) => r.blockers.trim());
	const history = reviews.filter((r) => r.reviewedAt).sort((a, b) => b.reviewedAt!.localeCompare(a.reviewedAt!));
	const milestoneTitle = (id: string) => data.getMilestones().find((m) => m.id === id)?.title ?? '';
</script>

<svelte:head><title>Mentor home · TPC Studio</title></svelte:head>

<PageHeader eyebrow="Mentor dashboard" title="Hi, {mentor.displayName.split(' ')[0]}." subtitle="Reviews take about 15 minutes and use what teams have already written. No grading, no extra reports." />

<div class="stats">
	<div><strong>{teams.length}</strong><span>Assigned teams</span></div>
	<div class="hl"><strong>{ready.length}</strong><span>Ready for review</span></div>
	<div><strong>{blockers.length}</strong><span>Reported blockers</span></div>
	<div><strong>{fmtDate(ms.targetDate, { month: 'short', day: 'numeric' })}</strong><span>M{ms.number} target ({relativeDays(today, ms.targetDate)})</span></div>
</div>

<div class="grid">
	<div class="col">
		<Card title="Ready for review" eyebrow="Upcoming milestone reviews" tone="highlight" id="ready">
			{#if ready.length}
				<ul class="list">
					{#each ready as r (r.id)}
						<li>
							<ClipboardCheck size={18} aria-hidden="true" />
							<div class="grow">
								<strong>{r.team.name}</strong>
								<span>{milestoneTitle(r.milestoneId)} · marked ready {timeAgo(r.readyAt!, today)}</span>
							</div>
							<Button size="sm" variant="primary" href="/mentor/teams/{r.team.id}?tab=review" iconRight={ArrowRight}>Review</Button>
						</li>
					{/each}
				</ul>
			{:else}
				<EmptyState title="No teams waiting" body="Teams appear here when they mark a milestone ready." mascot={false} />
			{/if}
		</Card>

		<section>
			<h2 class="h">Your teams</h2>
			<div class="teams">
				{#each teams as t (t.id)}<TeamCard team={t} href="/mentor/teams/{t.id}" />{/each}
			</div>
		</section>
	</div>

	<div class="col">
		<Card title="Reported blockers" id="blockers">
			{#if blockers.length}
				<ul class="list">
					{#each blockers as b (b.id)}
						<li class="warn">
							<TriangleAlert size={16} aria-hidden="true" />
							<div class="grow"><strong>{b.team.name}</strong><span>{b.blockers}</span></div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">No blockers reported.</p>
			{/if}
		</Card>

		<Card title="Feedback history" id="history">
			{#if history.length}
				<ul class="list">
					{#each history as h (h.id)}
						<li>
							<div class="grow">
								<div class="row"><strong>{h.team.name}</strong><MilestoneStatusBadge status={h.status} /></div>
								<span>{milestoneTitle(h.milestoneId)} · {timeAgo(h.reviewedAt!, today)}</span>
								<p>{h.feedback}</p>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">Your recorded reviews will appear here.</p>
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
