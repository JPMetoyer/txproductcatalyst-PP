<script lang="ts">
	import { Search } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ChallengeCard from '$lib/components/ui/ChallengeCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { DEMO, getChallenges, getSemester, getTeam } from '$lib/data';

	const semester = getSemester();
	const team = getTeam(DEMO.teamId)!;
	const all = getChallenges({ publishedOnly: true });
	let q = $state('');
	const list = $derived(
		all.filter((c) => (c.title + c.summary + c.stakeholders.join(' ')).toLowerCase().includes(q.trim().toLowerCase()))
	);
</script>

<svelte:head><title>Challenge Marketplace · TPC Studio</title></svelte:head>

<div class="theme">
	<span>{semester.name} theme</span>
	<strong>{semester.theme}</strong>
	<p>Explore everyday experiences, life transitions, and unfamiliar responsibilities. Each challenge describes an experience — not a solution. Your team decides what to build.</p>
</div>

<PageHeader title="Challenge Marketplace" subtitle="Academics assigns challenges based on your onboarding-form preferences. Browse them all for inspiration.">
	{#snippet actions()}
		<label class="search">
			<Search size={16} aria-hidden="true" />
			<span class="sr-only">Search challenges</span>
			<input type="search" placeholder="Search challenges" bind:value={q} />
		</label>
	{/snippet}
</PageHeader>

{#if list.length}
	<div class="grid">
		{#each list as c (c.id)}
			<ChallengeCard challenge={c} href="/challenges/{c.id}" assigned={c.id === team.challengeId} />
		{/each}
	</div>
{:else}
	<EmptyState title="No challenges match “{q}”" body="Try a broader word like “money” or “home”." />
{/if}

<style lang="scss">
	.theme {
		padding: var(--sp-5) var(--sp-5);
		margin-bottom: var(--sp-5);
		border-radius: var(--r-xl);
		background: var(--tpc-gradient);
		span {
			@include eyebrow;
			color: var(--tpc-ink);
			opacity: 0.75;
		}
		strong {
			display: block;
			font-family: var(--font-display);
			font-size: clamp(1.75rem, 4vw, 2.75rem);
			font-weight: 900;
			line-height: 1.1;
			margin: 4px 0 var(--sp-2);
		}
		p {
			max-width: 62ch;
		}
	}
	.search {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 36px;
		padding: 0 10px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		background: var(--c-surface);
		color: var(--c-text-muted);
		&:focus-within {
			@include focus-ring;
		}
		input {
			border: 0;
			background: none;
			outline: none;
			width: 200px;
			max-width: 50vw;
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
</style>
