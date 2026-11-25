<script lang="ts">
	import { ArrowRight, TriangleAlert, Flag } from '@lucide/svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import JourneyStrip from './JourneyStrip.svelte';
	import { JOURNEY, phaseMeta } from '$lib/config/phases';
	import { timeAgo } from '$lib/utils/format';
	import { READINESS } from '$lib/config/demo-day';
	import type { TeamSummary } from '$lib/server/teams';

	let { team, href }: { team: TeamSummary; href: string } = $props();
	const started = $derived(JOURNEY.slice(0, JOURNEY.indexOf(team.currentPhase) + 1));
	const behind = $derived(JOURNEY.indexOf(team.currentPhase) < JOURNEY.indexOf(team.recommendedPhase));
</script>

<a class="tc" {href}>
	<header>
		<div>
			<h3>{team.name}</h3>
			<p>{team.challengeTitle ?? 'No challenge assigned'} · {team.rosterCount} members</p>
		</div>
		<MilestoneStatusBadge status={team.nextMilestoneStatus} />
	</header>
	<div class="journey">
		<span>{phaseMeta(team.currentPhase).label}{#if behind}<em> · calendar suggests {phaseMeta(team.recommendedPhase).label}</em>{/if}</span>
		<JourneyStrip current={team.currentPhase} {started} compact />
	</div>
	{#each team.flags as f (f.id)}
		<p class="flag"><Flag size={14} aria-hidden="true" /> Flagged: {f.reason}</p>
	{/each}
	{#if team.blockers.length}
		<p class="blocker"><TriangleAlert size={14} aria-hidden="true" /> {team.blockers[0]}</p>
	{/if}
	<footer>
		<span>Updated {timeAgo(team.lastActivityAt, new Date().toISOString())} · Demo Day: {READINESS.find((r) => r.key === team.demoDayReadiness)?.label}</span>
		<span class="go">Open <ArrowRight size={14} aria-hidden="true" /></span>
	</footer>
</a>

<style lang="scss">
	.tc {
		@include card;
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		padding: var(--sp-4) var(--sp-5);
		text-decoration: none;
		color: inherit;
		transition:
			box-shadow var(--dur),
			border-color var(--dur);
		&:hover {
			box-shadow: var(--shadow-md);
			border-color: var(--c-border-strong);
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--sp-2);
		p {
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
	}
	h3 {
		font-size: var(--fs-md);
	}
	.journey {
		display: flex;
		flex-direction: column;
		gap: 6px;
		span {
			@include eyebrow;
			font-size: 11px;
		}
		em {
			font-style: normal;
			color: var(--deep-orange);
			text-transform: none;
			letter-spacing: 0;
		}
	}
	.blocker,
	.flag {
		display: flex;
		gap: 6px;
		align-items: flex-start;
		padding: 6px 10px;
		border-radius: var(--r-sm);
		background: var(--tint-orange);
		color: var(--deep-orange);
		font-size: var(--fs-xs);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 2px;
		}
	}
	.flag {
		background: var(--tint-red);
		color: var(--deep-red);
	}
	footer {
		display: flex;
		justify-content: space-between;
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		color: var(--c-text);
	}
</style>
