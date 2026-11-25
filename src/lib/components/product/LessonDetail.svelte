<script lang="ts">
	import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, Presentation, Calculator, FlaskConical, Target, Lightbulb, Users, BookOpen } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import { fmtDate } from '$lib/utils/format';
	import type { Lesson } from '$lib/types/domain';

	let { lesson: l, back, forTeam = true }: { lesson: Lesson; back: string; forTeam?: boolean } = $props();
	const tools = $derived(
		[
			l.relatedPhase === 'monetize' && { href: '/product/tools/business-model', label: 'Business Model Studio', icon: Calculator },
			l.relatedPhase === 'scope' && { href: '/product/tools/feasibility', label: 'Feasibility Explorer', icon: FlaskConical }
		].filter(Boolean) as { href: string; label: string; icon: typeof Calculator }[]
	);
</script>

<a class="back" href={back}><ArrowLeft size={16} aria-hidden="true" /> PM Academy</a>

<header class="head">
	<span class="gm">GM{l.gmNumber}</span>
	<div>
		<h1>{l.title}</h1>
		<p class="meta"><CalendarDays size={14} aria-hidden="true" /> {l.scheduledDate ? fmtDate(l.scheduledDate) : 'Date to be announced'}</p>
		{#if l.description}<p class="desc">{l.description}</p>{/if}
		<div class="actions">
			{#if l.slideUrl}<Button variant="primary" icon={Presentation} iconRight={ExternalLink} href={l.slideUrl}>Open slides</Button>{/if}
			{#if forTeam && l.relatedPhase}<Button href="/product/{l.relatedPhase}" iconRight={ArrowRight}>Apply it in {phaseMeta(l.relatedPhase).label}</Button>{/if}
		</div>
	</div>
</header>

<div class="layout">
	<article>
		{#if l.objectives?.length}
			<section><h2><Target size={18} aria-hidden="true" /> Learning objectives</h2><ul>{#each l.objectives as o}<li>{o}</li>{/each}</ul></section>
		{/if}
		{#if l.keyConcepts?.length}
			<section><h2><Lightbulb size={18} aria-hidden="true" /> Key concepts</h2><ul class="concepts">{#each l.keyConcepts as k}<li>{k}</li>{/each}</ul></section>
		{/if}
		{#if l.examples}
			<section><h2><BookOpen size={18} aria-hidden="true" /> Practical examples</h2><p class="pre">{l.examples}</p></section>
		{/if}
		{#if l.activity}
			<section class="activity"><h2><Users size={18} aria-hidden="true" /> Team activity</h2><p class="pre">{l.activity}</p></section>
		{/if}
		{#if !l.objectives?.length && !l.keyConcepts?.length && !l.examples && !l.activity}
			<p class="muted">Session details will be added by the Academics Committee.</p>
		{/if}
	</article>
	<aside>
		{#if l.topics.length}
			<div class="box"><p class="lbl">Topics</p><div class="chips">{#each l.topics as t}<span>{t}</span>{/each}</div></div>
		{/if}
		{#if forTeam && tools.length}
			<div class="box">
				<p class="lbl">Relevant PM tools</p>
				{#each tools as t (t.href)}{@const Icon = t.icon}<a class="tool" href={t.href}><Icon size={16} aria-hidden="true" /> {t.label}</a>{/each}
			</div>
		{/if}
		{#if l.resources?.length}
			<div class="box">
				<p class="lbl">Additional resources</p>
				{#each l.resources as r}<a class="tool" href={r.url} target="_blank" rel="noopener noreferrer">{r.title} <ExternalLink size={12} aria-hidden="true" /></a>{/each}
			</div>
		{/if}
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
	}
	.head {
		display: flex;
		gap: var(--sp-4);
		margin: var(--sp-4) 0 var(--sp-5);
		padding-bottom: var(--sp-5);
		border-bottom: 1px solid var(--c-border);
		h1 {
			font-size: clamp(1.75rem, 4vw, 2.5rem);
		}
	}
	.gm {
		display: grid;
		place-items: center;
		width: 72px;
		height: 72px;
		flex-shrink: 0;
		border-radius: var(--r-lg);
		background: var(--tpc-gradient);
		font-family: var(--font-display);
		font-weight: 900;
		font-size: var(--fs-lg);
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		color: var(--deep-blue);
		font-weight: 600;
		margin-top: 4px;
	}
	.desc {
		margin-top: var(--sp-2);
		font-size: var(--fs-md);
		color: var(--c-text-muted);
		max-width: 64ch;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		margin-top: var(--sp-4);
	}
	.layout {
		display: grid;
		gap: var(--sp-6);
		@include up($bp-md) {
			grid-template-columns: minmax(0, 1fr) 280px;
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
	ul {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: 6px;
	}
	.concepts {
		list-style: none;
		padding: 0;
		li {
			padding: var(--sp-2) var(--sp-3);
			border-radius: var(--r-md);
			background: var(--c-surface);
			border: 1px solid var(--c-border);
		}
	}
	.pre {
		white-space: pre-wrap;
		line-height: 1.65;
	}
	.activity {
		padding: var(--sp-4) var(--sp-5);
		border-radius: var(--r-lg);
		background: var(--tint-lavender);
	}
	aside {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.box {
		@include card;
		padding: var(--sp-4);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.lbl {
		@include eyebrow;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		span {
			padding: 2px 9px;
			border-radius: 999px;
			background: var(--c-surface-2);
			font-size: var(--fs-xs);
		}
	}
	.tool {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
		padding: 4px 0;
		&:hover {
			text-decoration: underline;
		}
	}
	.muted {
		color: var(--c-text-muted);
	}
</style>
