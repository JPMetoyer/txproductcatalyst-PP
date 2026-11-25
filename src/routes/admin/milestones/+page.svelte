<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Trash2 } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SemesterPicker from '$lib/components/ui/SemesterPicker.svelte';
	import { JOURNEY, phaseMeta } from '$lib/config/phases';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Milestone } from '$lib/types/domain';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	let adding = $state(false);
	let busy = $state(false);
	const nextNumber = $derived(Math.max(0, ...data.milestones.map((m) => m.number)) + 1);

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			busy = false;
			if (result.type === 'success') adding = false;
		};
	};
	const confirmDelete: SubmitFunction = (input) => {
		if (!confirm('Delete this milestone?')) input.cancel();
		return submit(input);
	};
</script>

{#snippet editor(m: (Milestone & { description: string }) | null)}
	<form method="POST" action="?/save" use:enhance={submit} class="form">
		<input type="hidden" name="id" value={m?.id ?? ''} />
		<input type="hidden" name="semesterId" value={data.current?.id} />
		<div class="grid four">
			<label><span>Number *</span><input type="number" name="number" min="1" max="10" value={m?.number ?? nextNumber} required /></label>
			<label><span>Title *</span><input name="title" value={m?.title ?? ''} required maxlength="120" placeholder="Opportunity Review" /></label>
			<label><span>Timing</span><input name="afterGm" value={m?.afterGm ?? ''} maxlength="60" placeholder="After GM3" /></label>
			<label><span>Target date</span><input type="date" name="targetDate" value={m?.targetDate ?? ''} /></label>
		</div>
		<label><span>Description</span><textarea name="description" rows="2" maxlength="2000">{m?.description ?? ''}</textarea></label>
		<div class="grid">
			<label><span>Review areas (one per line)</span><textarea name="reviewAreas" rows="5">{m?.reviewAreas.join('\n') ?? ''}</textarea></label>
			<label><span>Standard discussion questions (one per line)</span><textarea name="reviewQuestions" rows="5">{m?.reviewQuestions.join('\n') ?? ''}</textarea></label>
		</div>
		<fieldset>
			<legend>Documentation sections mentors review</legend>
			{#each JOURNEY as p}
				<label class="check"><input type="checkbox" name="relatedPhases" value={p} checked={m?.relatedPhases.includes(p) ?? false} /> {phaseMeta(p).label}</label>
			{/each}
		</fieldset>
		<div class="actions">
			{#if !m}<Button variant="ghost" onclick={() => (adding = false)}>Cancel</Button>{/if}
			<Button size="sm" variant="primary" type="submit" disabled={busy}>{m ? 'Save' : 'Add milestone'}</Button>
		</div>
	</form>
{/snippet}

<svelte:head><title>Milestones · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Milestones" subtitle="Lightweight reviews that use each team's existing documentation. Milestone status never blocks teams from any section.">
	{#snippet actions()}
		<SemesterPicker semesters={data.semesters} current={data.current} />
		{#if data.current && !adding}<Button variant="primary" icon={Plus} onclick={() => (adding = true)}>New milestone</Button>{/if}
	{/snippet}
</PageHeader>

{#if !data.current}
	<EmptyState title="No semester yet" body="Create a semester first."><Button variant="primary" href="/admin/semester">Semester settings</Button></EmptyState>
{:else}
	{#if adding}
		<section class="card new"><h2>New milestone</h2>{@render editor(null)}</section>
	{/if}
	{#each data.milestones as m (m.id)}
		<section class="card">
			<header>
				<h2>M{m.number} · {m.title}</h2>
				<div class="right">
					{#if data.reviewCounts[m.id]}<Badge tone="blue">{data.reviewCounts[m.id]} team review{data.reviewCounts[m.id] > 1 ? 's' : ''}</Badge>{/if}
					<form method="POST" action="?/delete" use:enhance={confirmDelete}>
						<input type="hidden" name="id" value={m.id} />
						<button class="icon-btn" type="submit" aria-label="Delete M{m.number}" title="Delete" disabled={!!data.reviewCounts[m.id]}><Trash2 size={15} /></button>
					</form>
				</div>
			</header>
			{@render editor(m)}
		</section>
	{:else}
		{#if !adding}<EmptyState title="No milestones yet" body="Most semesters use four: Opportunity, Business & Feasibility, Prototype, and Validation." />{/if}
	{/each}
{/if}

<style lang="scss">
	.card {
		@include card;
		padding: var(--sp-5);
		margin-bottom: var(--sp-4);
		&.new {
			border-color: var(--tpc-blue);
			box-shadow: 0 0 0 3px var(--tint-blue);
		}
		h2 {
			font-size: var(--fs-md);
			margin-bottom: var(--sp-3);
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.right {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		@include up($bp-md) {
			grid-template-columns: 1fr 1fr;
		}
		&.four {
			@include up($bp-md) {
				grid-template-columns: 90px 1fr 160px 170px;
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
	input:not([type='checkbox']),
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
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2) var(--sp-4);
		legend {
			font-size: var(--fs-sm);
			font-weight: 600;
			margin-bottom: var(--sp-2);
		}
	}
	.check {
		flex-direction: row;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--sp-2);
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: var(--r-sm);
		background: none;
		color: var(--c-text-muted);
		cursor: pointer;
		&:hover:not(:disabled) {
			background: var(--tint-red);
			color: var(--deep-red);
		}
		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}
	}
</style>
