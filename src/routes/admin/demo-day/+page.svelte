<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, X } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge, { type Tone } from '$lib/components/ui/Badge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SemesterPicker from '$lib/components/ui/SemesterPicker.svelte';
	import { READINESS, type RubricRow } from '$lib/config/demo-day';
	import { toast } from '$lib/stores/toast.svelte';

	let { data, form } = $props();
	let rubric = $state<RubricRow[]>([]);
	let loadedFor = '';
	$effect.pre(() => {
		// Reset the editable rubric when switching semesters or after saving.
		const key = `${data.current?.id}:${JSON.stringify(data.settings.rubric)}`;
		if (key !== loadedFor) {
			loadedFor = key;
			rubric = data.settings.rubric.map((r) => ({ ...r }));
		}
	});
	const total = $derived(rubric.reduce((n, r) => n + (Number(r.points) || 0), 0));
	let busy = $state(false);
	const s = $derived(data.settings);
	const res = $derived(s.resources.map((r) => (r.title === r.url ? r.url : `${r.title} | ${r.url}`)).join('\n'));
	const readinessOf = (k: string) => READINESS.find((r) => r.key === k)!;

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
</script>

<svelte:head><title>Demo Day · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Demo Day" subtitle="Event details, rubric, and preparation checklist teams see on their Demo Day page.">
	{#snippet actions()}<SemesterPicker semesters={data.semesters} current={data.current} />{/snippet}
</PageHeader>

{#if !data.current}
	<EmptyState title="No semester yet" body="Create a semester first."><Button variant="primary" href="/admin/semester">Semester settings</Button></EmptyState>
{:else}
	<div class="layout">
		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				busy = true;
				return async ({ update }) => {
					await update({ reset: false });
					busy = false;
				};
			}}
		>
			<input type="hidden" name="semesterId" value={data.current.id} />
			<section>
				<h2>Event</h2>
				<div class="grid three">
					<label><span>Date</span><input type="date" name="date" value={s.date ?? ''} /></label>
					<label><span>Time</span><input name="time" value={s.time} maxlength="60" placeholder="6–8 PM" /></label>
					<label><span>Location</span><input name="location" value={s.location} maxlength="200" /></label>
				</div>
				<label><span>Presentation expectations</span><textarea name="instructions" rows="3" maxlength="4000">{s.instructions}</textarea></label>
			</section>

			<section>
				<div class="rubric-head">
					<h2>Judging rubric</h2>
					<Badge tone={total === 100 ? 'green' : 'orange'}>{total} points{total !== 100 ? ' (usually 100)' : ''}</Badge>
				</div>
				<div class="rubric">
					{#each rubric as row, i (i)}
						<div class="rrow">
							<input name="rubricLabel" bind:value={row.label} placeholder="Category" aria-label="Category {i + 1}" maxlength="120" />
							<input name="rubricPoints" type="number" min="0" bind:value={row.points} aria-label="Points for category {i + 1}" />
							<input name="rubricDesc" bind:value={row.description} placeholder="What judges look for (optional)" aria-label="Description {i + 1}" maxlength="500" />
							<button type="button" class="x" onclick={() => rubric.splice(i, 1)} aria-label="Remove category {i + 1}"><X size={14} /></button>
						</div>
					{/each}
				</div>
				<Button size="sm" icon={Plus} onclick={() => rubric.push({ label: '', points: 5, description: '' })}>Add category</Button>
			</section>

			<section>
				<h2>Team preparation</h2>
				<p class="hint">One item per line.</p>
				<label><span>Preparation checklist</span><textarea name="checklist" rows="6">{s.checklist.join('\n')}</textarea></label>
				<label><span>Sample judge questions</span><textarea name="judgeQuestions" rows="5">{s.judgeQuestions.join('\n')}</textarea></label>
				<label><span>Presentation resources (<code>Title | https://link</code>)</span><textarea name="resources" rows="3">{res}</textarea></label>
			</section>
			<div class="save"><Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Demo Day settings'}</Button></div>
		</form>

		<aside>
			<h2>Team readiness</h2>
			<p class="hint">Teams set this themselves on their Demo Day page.</p>
			<ul>
				{#each data.teams as t (t.id)}
					{@const r = readinessOf(t.readiness)}
					<li><span>{t.name}</span><Badge tone={r.tone as Tone} dot>{r.label}</Badge></li>
				{:else}
					<li class="hint">No teams this semester.</li>
				{/each}
			</ul>
		</aside>
	</div>
{/if}

<style lang="scss">
	.layout {
		display: grid;
		gap: var(--sp-5);
		@include up($bp-lg) {
			grid-template-columns: 1fr 280px;
		}
	}
	form {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}
	section,
	aside {
		@include card;
		padding: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		h2 {
			font-size: var(--fs-md);
		}
	}
	aside {
		align-self: start;
		ul {
			list-style: none;
			margin: 0;
			padding: 0;
			display: grid;
			gap: var(--sp-2);
		}
		li {
			display: flex;
			justify-content: space-between;
			gap: var(--sp-2);
			font-size: var(--fs-sm);
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		&.three {
			@include up($bp-sm) {
				grid-template-columns: 170px 140px 1fr;
			}
		}
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		span {
			font-size: var(--fs-sm);
			font-weight: 600;
		}
	}
	input,
	textarea {
		padding: 8px 10px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		field-sizing: content;
		min-height: 38px;
		&:focus {
			@include focus-ring;
			outline-offset: 0;
		}
	}
	.rubric-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.rubric {
		display: grid;
		gap: 6px;
	}
	.rrow {
		display: grid;
		grid-template-columns: 1fr 70px;
		gap: 6px;
		align-items: center;
		@include up($bp-md) {
			grid-template-columns: 1.2fr 70px 1.5fr 28px;
		}
		input:nth-child(3) {
			@include down($bp-md) {
				grid-column: 1 / -1;
			}
		}
	}
	.x {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--c-text-faint);
		cursor: pointer;
		&:hover {
			background: var(--tint-red);
			color: var(--deep-red);
		}
	}
	.hint {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	code {
		font-size: var(--fs-xs);
		background: var(--c-surface-2);
		padding: 1px 4px;
		border-radius: 3px;
	}
	.save {
		display: flex;
		justify-content: flex-end;
	}
</style>
