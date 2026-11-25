<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowRight, TriangleAlert, Plus, Flag } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import { toast } from '$lib/stores/toast.svelte';
	import type { MilestoneStatus } from '$lib/types/domain';
	import { fmtDate, relativeDays, timeAgo } from '$lib/utils/format';

	let { data, form } = $props();
	const now = new Date().toISOString();
	const upcoming = $derived(data.milestones.filter((m) => !m.targetDate || m.targetDate >= data.today));
	const firstMs = $derived(data.milestones[0]);
	const count = (msId: string, s: MilestoneStatus) =>
		s === 'upcoming'
			? data.teams.length - data.reviews.filter((r) => r.milestoneId === msId && r.status !== 'upcoming').length
			: data.reviews.filter((r) => r.milestoneId === msId && r.status === s).length;
	const statusOf = (teamId: string, msId: string) => data.reviews.find((r) => r.teamId === teamId && r.milestoneId === msId)?.status ?? 'upcoming';

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error');
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
</script>

<svelte:head><title>Admin overview · TPC Studio</title></svelte:head>

{#if !data.semester}
	<PageHeader title="Semester overview" />
	<EmptyState title="No active semester" body="Create or activate a semester to get started.">
		<Button variant="primary" href="/admin/semester">Semester settings</Button>
	</EmptyState>
{:else}
	<PageHeader eyebrow="{data.semester.name} · {data.semester.theme}" title="Semester overview">
		{#snippet actions()}
			<Button href="/admin/teams" icon={Plus} variant="primary">Create team</Button>
		{/snippet}
	</PageHeader>

	<div class="stats">
		<a href="/admin/teams"><strong>{data.teams.length}</strong><span>Active teams</span></a>
		<a href="/admin/teams"><strong>{data.memberCount}</strong><span>Team members</span></a>
		<a href="/admin/mentors"><strong>{data.mentorCount}</strong><span>Mentors</span></a>
		<a href="#support" class:warn={data.flags.length > 0}><strong>{data.flags.length}</strong><span>Flagged for support</span></a>
	</div>

	<div class="grid">
		<div class="col">
			<Card title="Teams requiring support" id="support" tone={data.flags.length ? 'highlight' : 'default'}>
				{#if data.flags.length}
					<ul class="flags">
						{#each data.flags as f (f.id)}
							<li>
								<Flag size={16} aria-hidden="true" />
								<div class="grow">
									<strong>{f.teamName}</strong>
									<p>{f.reason}</p>
									<span>Flagged by {f.flaggedBy} · {fmtDate(f.createdAt.slice(0, 10))}</span>
								</div>
								<form method="POST" action="?/clearFlag" use:enhance>
									<input type="hidden" name="id" value={f.id} />
									<Button size="sm" type="submit">Clear</Button>
								</form>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="muted">No teams flagged by mentors.</p>
				{/if}
				{#if data.concerns.length}
					<p class="lbl">Other signals</p>
					<ul class="list">
						{#each data.concerns as c (c.id)}
							<li><TriangleAlert size={14} aria-hidden="true" /><div><strong>{c.name}</strong><span>{c.text}</span></div></li>
						{/each}
					</ul>
				{/if}
			</Card>

			<Card title="Upcoming milestones" id="milestones">
				{#if upcoming.length}
					<div class="ms-list">
						{#each upcoming as m (m.id)}
							{@const reviewed = count(m.id, 'reviewed') + count(m.id, 'follow-up')}
							<div>
								<div class="ms-head">
									<div>
										<strong>M{m.number} · {m.title}</strong>
										<span>{m.targetDate ? `${fmtDate(m.targetDate)} · ${relativeDays(data.today, m.targetDate)}` : 'No date set'}</span>
									</div>
									<span class="count">{reviewed}/{data.teams.length} reviewed</span>
								</div>
								<div class="bar" role="img" aria-label="{count(m.id, 'reviewed')} reviewed, {count(m.id, 'follow-up')} follow-up, {count(m.id, 'ready')} ready, {count(m.id, 'upcoming')} upcoming">
									<span class="g" style:flex={count(m.id, 'reviewed')}></span>
									<span class="o" style:flex={count(m.id, 'follow-up')}></span>
									<span class="b" style:flex={count(m.id, 'ready')}></span>
									<span class="n" style:flex={count(m.id, 'upcoming')}></span>
								</div>
								<div class="legend">
									<span><i class="g"></i>Reviewed {count(m.id, 'reviewed')}</span>
									<span><i class="o"></i>Follow-up {count(m.id, 'follow-up')}</span>
									<span><i class="b"></i>Ready {count(m.id, 'ready')}</span>
									<span><i class="n"></i>Upcoming {count(m.id, 'upcoming')}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="muted">No upcoming milestones. <a href="/admin/milestones">Set milestone dates</a>.</p>
				{/if}
			</Card>

			<Card title="All teams" id="teams" pad={false}>
				{#snippet action()}<Button size="sm" variant="ghost" href="/admin/teams" iconRight={ArrowRight}>Manage</Button>{/snippet}
				<div class="scroll">
					<table>
						<thead><tr><th>Team</th><th>Challenge</th><th>Mentor</th><th>Phase</th>{#if firstMs}<th>M{firstMs.number}</th>{/if}<th>Updated</th></tr></thead>
						<tbody>
							{#each data.teams as t (t.id)}
								<tr>
									<td><strong>{t.name}</strong></td>
									<td>{t.challengeTitle ?? '—'}</td>
									<td>{t.mentorNames.join(', ') || '—'}</td>
									<td>{phaseMeta(t.currentPhase).label}</td>
									{#if firstMs}<td><MilestoneStatusBadge status={statusOf(t.id, firstMs.id)} /></td>{/if}
									<td class="muted">{timeAgo(t.lastActivityAt, now)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</div>

		<div class="col">
			<Card title="Recent milestone activity" id="activity">
				{#if data.activity.length}
					<ul class="list plain">
						{#each data.activity as a (a.id)}
							<li>
								<div>
									<strong>{a.teamName}</strong>
									<span>{a.status === 'ready' ? 'marked ready for' : a.status === 'follow-up' ? 'needs follow-up on' : 'reviewed for'} {a.msTitle} · {timeAgo(a.at, now)}</span>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="muted">Nothing yet this semester.</p>
				{/if}
			</Card>
		</div>
	</div>
{/if}

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
				background: var(--tint-red);
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
	.flags {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-3);
		li {
			display: flex;
			gap: var(--sp-3);
			align-items: flex-start;
			padding: var(--sp-3);
			border-radius: var(--r-md);
			background: var(--tint-red);
			:global(svg) {
				color: var(--deep-red);
				flex-shrink: 0;
				margin-top: 3px;
			}
		}
		p {
			font-size: var(--fs-sm);
			margin: 2px 0;
		}
		span {
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.lbl {
		@include eyebrow;
		margin: var(--sp-4) 0 var(--sp-2);
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
