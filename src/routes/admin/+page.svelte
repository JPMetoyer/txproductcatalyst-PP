<script lang="ts">
	import { ArrowRight, TriangleAlert, Plus } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import type { MilestoneStatus } from '$lib/types/domain';
	import * as data from '$lib/data';
	import { fmtDate, relativeDays, timeAgo } from '$lib/utils/format';

	const today = data.today();
	const semester = data.getSemester();
	const teams = data.getTeams().filter((t) => t.status === 'active');
	const memberCount = teams.reduce((n, t) => n + data.getRoster(t.id).length, 0);
	const mentors = data.getMentors().filter((m) => m.active);
	const milestones = data.getMilestones();
	const upcoming = milestones.filter((m) => m.targetDate >= today);
	const support = data.teamsNeedingSupport();
	const activity = data
		.getReviews()
		.filter((r) => r.reviewedAt || r.readyAt)
		.map((r) => ({ ...r, at: (r.reviewedAt ?? r.readyAt)!, team: data.getTeam(r.teamId)!, ms: milestones.find((m) => m.id === r.milestoneId)! }))
		.sort((a, b) => b.at.localeCompare(a.at));

	const statusCount = (msId: string, s: MilestoneStatus) => data.getReviews().filter((r) => r.milestoneId === msId && r.status === s).length;
</script>

<svelte:head><title>Admin overview · TPC Studio</title></svelte:head>

<PageHeader eyebrow="{semester.name} · {semester.theme}" title="Semester overview">
	{#snippet actions()}
		<Button href="/admin/teams" icon={Plus} variant="primary">Create team</Button>
	{/snippet}
</PageHeader>

<div class="stats">
	<a href="/admin/teams"><strong>{teams.length}</strong><span>Active teams</span></a>
	<a href="/admin/teams"><strong>{memberCount}</strong><span>Team members</span></a>
	<a href="/admin/mentors"><strong>{mentors.length}</strong><span>Mentors</span></a>
	<a href="#support" class:warn={support.length > 0}><strong>{support.length}</strong><span>Need support</span></a>
</div>

<div class="grid">
	<div class="col">
		<Card title="Upcoming milestones" id="milestones">
			<div class="ms-list">
				{#each upcoming as m (m.id)}
					{@const reviewed = statusCount(m.id, 'reviewed') + statusCount(m.id, 'follow-up')}
					<div class="ms">
						<div class="ms-head">
							<div>
								<strong>M{m.number} · {m.title}</strong>
								<span>{fmtDate(m.targetDate)} · {relativeDays(today, m.targetDate)}</span>
							</div>
							<span class="count">{reviewed}/{teams.length} reviewed</span>
						</div>
						<div class="bar" role="img" aria-label="{statusCount(m.id, 'reviewed')} reviewed, {statusCount(m.id, 'follow-up')} follow-up, {statusCount(m.id, 'ready')} ready, of {teams.length} teams">
							<span class="g" style:flex={statusCount(m.id, 'reviewed')}></span>
							<span class="o" style:flex={statusCount(m.id, 'follow-up')}></span>
							<span class="b" style:flex={statusCount(m.id, 'ready')}></span>
							<span class="n" style:flex={statusCount(m.id, 'upcoming')}></span>
						</div>
						<div class="legend">
							<span><i class="g"></i>Reviewed {statusCount(m.id, 'reviewed')}</span>
							<span><i class="o"></i>Follow-up {statusCount(m.id, 'follow-up')}</span>
							<span><i class="b"></i>Ready {statusCount(m.id, 'ready')}</span>
							<span><i class="n"></i>Upcoming {statusCount(m.id, 'upcoming')}</span>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<Card title="All teams" id="teams" pad={false}>
			{#snippet action()}<Button size="sm" variant="ghost" href="/admin/teams" iconRight={ArrowRight}>Manage</Button>{/snippet}
			<div class="scroll">
				<table>
					<thead><tr><th>Team</th><th>Challenge</th><th>Mentor</th><th>Phase</th><th>M1</th><th>Last active</th></tr></thead>
					<tbody>
						{#each teams as t (t.id)}
							<tr>
								<td><strong>{t.name}</strong></td>
								<td>{data.getChallenge(t.challengeId ?? '')?.title ?? '—'}</td>
								<td>{t.mentorIds.map((id) => data.getMentor(id)?.displayName).join(', ') || '—'}</td>
								<td>{t.currentPhase[0].toUpperCase() + t.currentPhase.slice(1)}</td>
								<td><MilestoneStatusBadge status={data.getReview(t.id, 'ms-1')?.status ?? 'upcoming'} /></td>
								<td class="muted">{timeAgo(t.lastActivityAt, today)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	</div>

	<div class="col">
		<Card title="Teams requiring support" id="support">
			{#if support.length}
				<ul class="list">
					{#each support as t (t.id)}
						{@const r = data.getReviews(t.id).find((x) => x.blockers || x.status === 'follow-up')}
						<li>
							<TriangleAlert size={16} aria-hidden="true" />
							<div>
								<strong>{t.name}</strong>
								<span>{r?.blockers || r?.nextSteps}</span>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">No teams flagged.</p>
			{/if}
		</Card>

		<Card title="Recent milestone activity" id="activity">
			<ul class="list plain">
				{#each activity.slice(0, 6) as a (a.id)}
					<li>
						<div>
							<strong>{a.team.name}</strong>
							<span>{a.status === 'ready' ? 'marked ready for' : a.status === 'follow-up' ? 'needs follow-up on' : 'reviewed for'} {a.ms.title} · {timeAgo(a.at, today)}</span>
						</div>
					</li>
				{/each}
			</ul>
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
		a {
			@include card;
			padding: var(--sp-4);
			display: flex;
			flex-direction: column;
			text-decoration: none;
			&:hover {
				border-color: var(--c-border-strong);
			}
			&.warn {
				background: var(--tint-orange);
				border-color: transparent;
			}
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
			grid-template-columns: 1.6fr 1fr;
		}
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		min-width: 0;
	}
	:global(#teams > header) {
		padding: var(--sp-5) var(--sp-5) 0;
	}
	.ms-list {
		display: flex;
		flex-direction: column;
		gap: var(--sp-5);
	}
	.ms-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--sp-2);
		margin-bottom: 6px;
		div {
			display: flex;
			flex-direction: column;
		}
		span {
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
	}
	.count {
		font-weight: 600;
	}
	.bar {
		display: flex;
		height: 8px;
		border-radius: 999px;
		overflow: hidden;
		gap: 2px;
		background: var(--c-surface-2);
	}
	.g { background: #3fae6e; }
	.o { background: var(--tpc-orange); }
	.b { background: var(--tpc-blue); }
	.n { background: var(--c-border); }
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-3);
		margin-top: 6px;
		font-size: 11px;
		color: var(--c-text-muted);
		i {
			display: inline-block;
			width: 8px;
			height: 8px;
			border-radius: 2px;
			margin-right: 4px;
		}
	}
	.scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-sm);
	}
	th,
	td {
		padding: 10px var(--sp-5);
		text-align: left;
		white-space: nowrap;
		border-top: 1px solid var(--c-border);
	}
	th {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		font-weight: 600;
		background: var(--c-bg);
	}
	.muted {
		color: var(--c-text-muted);
		font-size: var(--fs-sm);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-3);
		li {
			display: flex;
			gap: var(--sp-2);
			font-size: var(--fs-sm);
			:global(svg) {
				color: var(--deep-orange);
				flex-shrink: 0;
				margin-top: 3px;
			}
			div {
				display: flex;
				flex-direction: column;
			}
			span {
				color: var(--c-text-muted);
				font-size: var(--fs-xs);
			}
		}
	}
</style>
