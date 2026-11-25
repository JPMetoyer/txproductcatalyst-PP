<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import { fmtDate } from '$lib/utils/format';

	import type { Lesson } from '$lib/types/domain';

	let { lessons: all, today: t, linkToProduct = true, base = '/academy' }: { lessons: Lesson[]; today: string; linkToProduct?: boolean; base?: string } = $props();
	const lessons = $derived(all.filter((l) => l.published).sort((a, b) => a.gmNumber - b.gmNumber));
	const upcoming = $derived(lessons.find((l) => l.scheduledDate != null && l.scheduledDate >= t));
</script>

<ol class="lessons">
	{#each lessons as l (l.id)}
		<li class:next={l === upcoming} class:past={l.scheduledDate != null && l.scheduledDate < t}>
			<span class="gm">GM{l.gmNumber}</span>
			<div class="body">
				<div class="row">
					<h2><a class="title" href="{base}/{l.id}">{l.title}</a></h2>
					{#if l === upcoming}<Badge tone="pink">Up next</Badge>{/if}
				</div>
				<p class="date">{l.scheduledDate ? fmtDate(l.scheduledDate) : 'Date to be announced'}</p>
				<p>{l.description}</p>
				<ul class="topics">{#each l.topics as tp}<li>{tp}</li>{/each}</ul>
				{#if linkToProduct && l.relatedPhase}
					<a href="/product/{l.relatedPhase}">Apply it in {phaseMeta(l.relatedPhase).label} <ArrowRight size={14} aria-hidden="true" /></a>
				{/if}
			</div>
		</li>
	{/each}
</ol>
<p class="more">More sessions are published by the Academics Committee as the semester progresses.</p>

<style lang="scss">
	.lessons {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-3);
	}
	li {
		display: flex;
		gap: var(--sp-4);
		@include card;
		padding: var(--sp-4) var(--sp-5);
		&.next {
			border-color: var(--tpc-pink);
			box-shadow: 0 0 0 3px var(--tint-pink);
		}
		&.past .gm {
			background: var(--c-surface-2);
			color: var(--c-text-muted);
		}
	}
	.gm {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		flex-shrink: 0;
		border-radius: var(--r-md);
		background: var(--tpc-gradient);
		font-family: var(--font-display);
		font-weight: 900;
	}
	.body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	h2 {
		font-size: var(--fs-md);
	}
	.title {
		display: inline;
		font-size: inherit;
		font-weight: inherit;
		color: inherit;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
	.date {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.topics {
		list-style: none;
		padding: 0;
		margin: 4px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		li {
			padding: 2px 9px;
			border-radius: 999px;
			background: var(--c-surface-2);
			font-size: var(--fs-xs);
		}
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
	.more {
		margin-top: var(--sp-4);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}
</style>
