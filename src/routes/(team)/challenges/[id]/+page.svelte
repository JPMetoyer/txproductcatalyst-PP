<script lang="ts">
	import { ArrowLeft, Users, Compass, Target, Search, ShieldAlert, ListChecks } from '@lucide/svelte';
	import ChallengeIcon from '$lib/components/ui/ChallengeIcon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { DEMO, getTeam } from '$lib/data';

	let { data } = $props();
	const c = $derived(data.challenge);
	const assigned = $derived(getTeam(DEMO.teamId)?.challengeId === c.id);
</script>

<svelte:head><title>{c.title} · Challenge brief · TPC Studio</title></svelte:head>

<a class="back" href="/challenges"><ArrowLeft size={16} aria-hidden="true" /> All challenges</a>

<header class="head {c.accent}">
	<span class="icon"><ChallengeIcon icon={c.icon} size={30} /></span>
	<div>
		<div class="tags">
			<Badge>{c.code}</Badge>
			{#if assigned}<Badge tone="ink">Your challenge</Badge>{/if}
		</div>
		<h1>{c.title}</h1>
		<p>{c.summary}</p>
	</div>
</header>

<div class="layout">
	<article>
		<section>
			<h2><Compass size={18} aria-hidden="true" /> The experience</h2>
			<p>{c.experience}</p>
		</section>
		<section class="mission {c.accent}">
			<h2><Target size={18} aria-hidden="true" /> The mission</h2>
			<p>{c.mission}</p>
		</section>
		<section>
			<h2><ListChecks size={18} aria-hidden="true" /> Expectations</h2>
			<ul class="checks">
				{#each c.expectations as e}<li>{e}</li>{/each}
			</ul>
		</section>
		<section>
			<h2><Search size={18} aria-hidden="true" /> Research considerations</h2>
			<ul>
				{#each c.researchConsiderations as r}<li>{r}</li>{/each}
			</ul>
		</section>
		<section>
			<h2><ShieldAlert size={18} aria-hidden="true" /> Project boundaries</h2>
			<ul>
				{#each c.boundaries as b}<li>{b}</li>{/each}
			</ul>
		</section>
	</article>

	<aside>
		<div class="side">
			<h2><Users size={16} aria-hidden="true" /> Potential stakeholders</h2>
			<ul class="chips">
				{#each c.stakeholders as s}<li>{s}</li>{/each}
			</ul>
			<p class="muted">Look beyond the obvious user — the paying customer may be someone else entirely.</p>
			{#if assigned}
				<Button variant="primary" full href="/product/discover">Start discovering</Button>
			{/if}
		</div>
	</aside>
</div>

<style lang="scss">
	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-text-muted);
		text-decoration: none;
		margin-bottom: var(--sp-4);
		&:hover {
			color: var(--c-text);
		}
	}
	.head {
		--tint: var(--tint-blue);
		--deep: var(--deep-blue);
		--accent: var(--tpc-blue);
		display: flex;
		gap: var(--sp-4);
		align-items: flex-start;
		padding-bottom: var(--sp-5);
		margin-bottom: var(--sp-5);
		border-bottom: 1px solid var(--c-border);
		h1 {
			font-size: clamp(1.75rem, 4vw, 2.5rem);
			margin: var(--sp-2) 0 var(--sp-1);
		}
		p {
			color: var(--c-text-muted);
			font-size: var(--fs-md);
		}
	}
	.pink { --tint: var(--tint-pink); --deep: var(--deep-pink); --accent: var(--tpc-pink); }
	.orange { --tint: var(--tint-orange); --deep: var(--deep-orange); --accent: var(--tpc-orange); }
	.lavender { --tint: var(--tint-lavender); --deep: var(--deep-lavender); --accent: var(--tpc-lavender); }
	.icon {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		flex-shrink: 0;
		border-radius: var(--r-lg);
		background: var(--tint);
		color: var(--deep);
	}
	.tags {
		display: flex;
		gap: 6px;
	}
	.layout {
		display: grid;
		gap: var(--sp-6);
		@include up($bp-md) {
			grid-template-columns: minmax(0, 1fr) 300px;
		}
	}
	article {
		display: flex;
		flex-direction: column;
		gap: var(--sp-5);
		max-width: 68ch;
	}
	h2 {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-md);
		margin-bottom: var(--sp-2);
	}
	section p {
		font-size: var(--fs-md);
		line-height: 1.65;
	}
	.mission {
		--tint: var(--tint-blue);
		--accent: var(--tpc-blue);
		padding: var(--sp-4) var(--sp-5);
		border-radius: var(--r-lg);
		background: var(--tint);
		border-left: 4px solid var(--accent);
	}
	ul {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: 6px;
	}
	.checks {
		list-style: none;
		padding: 0;
		li {
			padding-left: 26px;
			position: relative;
			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 4px;
				width: 16px;
				height: 16px;
				border-radius: 4px;
				border: 2px solid var(--c-border-strong);
			}
		}
	}
	.side {
		@include card;
		padding: var(--sp-5);
		position: sticky;
		top: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		h2 {
			font-size: var(--fs-base);
			margin: 0;
		}
	}
	.chips {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		li {
			padding: 4px 10px;
			border-radius: 999px;
			background: var(--c-surface-2);
			font-size: var(--fs-sm);
		}
	}
	.muted {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}
</style>
