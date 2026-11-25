<script lang="ts">
	import { ArrowRight, TriangleAlert } from '@lucide/svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import JourneyStrip from './JourneyStrip.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import * as data from '$lib/data';
	import { timeAgo } from '$lib/utils/format';
	import type { Team } from '$lib/types/domain';

	let { team, href }: { team: Team; href: string } = $props();
	const challenge = $derived(data.getChallenge(team.challengeId ?? ''));
	const ms = data.getNextMilestone();
	const review = $derived(data.getReview(team.id, ms.id));
	const blockers = $derived(data.getReviews(team.id).filter((r) => r.blockers.trim()).map((r) => r.blockers));
	const roster = $derived(data.getRoster(team.id));
</script>

<a class="tc" {href}>
	<header>
		<div>
			<h3>{team.name}</h3>
			<p>{challenge?.title ?? 'No challenge assigned'} · {roster.length} members</p>
		</div>
		{#if review}<MilestoneStatusBadge status={review.status} />{/if}
	</header>
	<div class="journey">
		<span>{phaseMeta(team.currentPhase).label}</span>
		<JourneyStrip current={team.currentPhase} started={team.phasesStarted} compact />
	</div>
	{#if blockers.length}
		<p class="blocker"><TriangleAlert size={14} aria-hidden="true" /> {blockers[0]}</p>
	{/if}
	<footer>
		<span>Active {timeAgo(team.lastActivityAt, data.today())}</span>
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
	}
	.blocker {
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
