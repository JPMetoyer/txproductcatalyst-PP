<script lang="ts">
	import { enhance } from '$app/forms';
	import { CalendarDays, MapPin, ExternalLink, Presentation, Figma, MessageCircleQuestion, ArrowRight } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Capybara from '$lib/components/ui/Capybara.svelte';
	import { READINESS, rubricTotal } from '$lib/config/demo-day';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate, relativeDays } from '$lib/utils/format';

	let { data, form } = $props();
	const s = $derived(data.settings);
	// svelte-ignore state_referenced_locally (local copy for instant checkbox feedback)
	let checked = $state<string[]>([...data.checked]);
	const done = $derived(s.checklist.filter((c) => checked.includes(c)).length);
	const readOnly = $derived(data.ctx?.semester.status === 'archived');
	let checklistForm: HTMLFormElement | undefined = $state();

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error');
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
</script>

<svelte:head><title>Demo Day · TPC Studio</title></svelte:head>

<section class="hero">
	<div>
		<span class="eyebrow">{data.ctx?.semester.name}</span>
		<h1>Demo Day</h1>
		<div class="facts">
			<span><CalendarDays size={16} aria-hidden="true" /> {s.date ? `${fmtDate(s.date)}${s.time ? ` · ${s.time}` : ''} (${relativeDays(data.today, s.date)})` : 'Date to be announced'}</span>
			{#if s.location}<span><MapPin size={16} aria-hidden="true" /> {s.location}</span>{/if}
		</div>
		{#if s.instructions}<p class="instructions">{s.instructions}</p>{/if}
	</div>
	<Capybara size={110} mood="party" />
</section>

<div class="grid">
	<div class="col">
		<Card title="Your readiness" eyebrow="Visible to your mentor and the Academics Committee">
			<form method="POST" action="?/readiness" use:enhance={() => async ({ update }) => update({ reset: false })}>
				<div class="readiness" role="radiogroup" aria-label="Demo Day readiness">
				{#each READINESS as r (r.key)}
					<label class="{r.key}" class:on={data.readiness === r.key}>
						<input type="radio" name="readiness" value={r.key} checked={data.readiness === r.key} disabled={readOnly} onchange={(e) => e.currentTarget.form?.requestSubmit()} />
						{r.label}
					</label>
				{/each}
				</div>
			</form>
		</Card>

		{#if s.checklist.length}
			<Card title="Preparation checklist" eyebrow="{done} of {s.checklist.length} done">
				<form method="POST" action="?/checklist" bind:this={checklistForm} use:enhance={() => async ({ update }) => update({ reset: false, invalidateAll: false })}>
					<ul class="checklist">
						{#each s.checklist as item (item)}
							<li>
								<label>
									<input type="checkbox" name="item" value={item} bind:group={checked} disabled={readOnly} onchange={() => checklistForm?.requestSubmit()} />
									<span>{item}</span>
								</label>
							</li>
						{/each}
					</ul>
				</form>
			</Card>
		{/if}

		<Card title="Judging rubric" eyebrow="{rubricTotal(s.rubric)} points total">
			<table>
				<tbody>
					{#each s.rubric as row (row.label)}
						<tr>
							<td>{row.label}{#if row.description}<span class="desc">{row.description}</span>{/if}</td>
							<td class="pts">{row.points}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card>
	</div>

	<div class="col">
		<Card title="Your links">
			<ul class="links">
				<li>
					<Presentation size={16} aria-hidden="true" />
					{#if data.presentationUrl}<a href={data.presentationUrl} target="_blank" rel="noopener noreferrer">Presentation <ExternalLink size={12} aria-hidden="true" /></a>
					{:else}<span class="missing">No presentation link yet</span>{/if}
				</li>
				<li>
					<Figma size={16} aria-hidden="true" />
					{#if data.prototypeUrl}<a href={data.prototypeUrl} target="_blank" rel="noopener noreferrer">Prototype <ExternalLink size={12} aria-hidden="true" /></a>
					{:else}<span class="missing">No prototype link yet</span>{/if}
				</li>
			</ul>
			<a class="more" href="/product/showcase">Edit in Showcase <ArrowRight size={14} aria-hidden="true" /></a>
		</Card>

		{#if s.judgeQuestions.length}
			<Card title="Sample judge questions">
				<ul class="qs">{#each s.judgeQuestions as q}<li><MessageCircleQuestion size={16} aria-hidden="true" /> {q}</li>{/each}</ul>
				<a class="more" href="/product/showcase">Draft answers in Showcase <ArrowRight size={14} aria-hidden="true" /></a>
			</Card>
		{/if}

		{#if s.resources.length}
			<Card title="Presentation resources">
				<ul class="links">{#each s.resources as r}<li><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title} <ExternalLink size={12} aria-hidden="true" /></a></li>{/each}</ul>
			</Card>
		{/if}
	</div>
</div>

<style lang="scss">
	.hero {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		padding: var(--sp-5) var(--sp-6);
		margin-bottom: var(--sp-5);
		border-radius: var(--r-xl);
		background: var(--tpc-gradient);
		h1 {
			font-size: clamp(2rem, 5vw, 3rem);
			font-weight: 900;
		}
		@include down($bp-sm) {
			padding: var(--sp-5);
			:global(.capy) {
				display: none;
			}
		}
	}
	.eyebrow {
		@include eyebrow;
		color: var(--tpc-ink);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-4);
		margin-top: var(--sp-2);
		font-weight: 600;
		span {
			display: inline-flex;
			align-items: center;
			gap: 6px;
		}
	}
	.instructions {
		margin-top: var(--sp-3);
		max-width: 62ch;
		white-space: pre-wrap;
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1.3fr 1fr;
		}
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		min-width: 0;
	}
	.readiness {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		label {
			display: inline-flex;
			align-items: center;
			padding: 8px 16px;
			border-radius: 999px;
			border: 1px solid var(--c-border-strong);
			font-weight: 600;
			font-size: var(--fs-sm);
			cursor: pointer;
			input {
				position: absolute;
				opacity: 0;
				pointer-events: none;
			}
			&:focus-within {
				@include focus-ring;
			}
			&.on.not-started {
				background: var(--c-surface-2);
			}
			&.on.in-progress {
				background: var(--tint-orange);
				border-color: var(--tpc-orange);
				color: var(--deep-orange);
			}
			&.on.ready {
				background: var(--tint-green);
				border-color: #3fae6e;
				color: var(--deep-green);
			}
		}
	}
	.checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		label {
			display: flex;
			gap: var(--sp-2);
			align-items: flex-start;
			font-size: var(--fs-sm);
			cursor: pointer;
		}
		input {
			width: 16px;
			height: 16px;
			margin-top: 2px;
			accent-color: var(--tpc-ink);
		}
		input:checked + span {
			text-decoration: line-through;
			color: var(--c-text-muted);
		}
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-sm);
		td {
			padding: 8px 0;
			border-top: 1px solid var(--c-border);
		}
		tr:first-child td {
			border-top: 0;
		}
	}
	.pts {
		text-align: right;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.desc {
		display: block;
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.links,
	.qs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
		li {
			display: flex;
			align-items: flex-start;
			gap: var(--sp-2);
			:global(svg) {
				flex-shrink: 0;
				margin-top: 2px;
			}
		}
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
	}
	.qs :global(svg) {
		color: var(--deep-pink);
	}
	.missing {
		color: var(--c-text-faint);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: var(--sp-3);
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
</style>
