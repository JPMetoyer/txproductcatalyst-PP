<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, ArrowUp, ArrowDown, Pencil, Eye, EyeOff, Trash2 } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SemesterPicker from '$lib/components/ui/SemesterPicker.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate } from '$lib/utils/format';
	import type { PhaseKey } from '$lib/types/domain';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
	const confirmDelete: SubmitFunction = (input) => {
		if (!confirm('Delete this GM permanently? This cannot be undone.')) input.cancel();
	};
	const q = $derived(data.current ? `?semester=${data.current.id}` : '');
</script>

<svelte:head><title>Curriculum · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Curriculum" subtitle="GM sessions for PM Academy. Dates here are the semester's GM schedule and drive each team's recommended phase.">
	{#snippet actions()}
		<SemesterPicker semesters={data.semesters} current={data.current} />
		{#if data.current}<Button variant="primary" icon={Plus} href="/admin/curriculum/new{q}">New GM</Button>{/if}
	{/snippet}
</PageHeader>

{#if !data.current}
	<EmptyState title="No semester yet" body="Create a semester first."><Button variant="primary" href="/admin/semester">Semester settings</Button></EmptyState>
{:else if data.lessons.length === 0}
	<EmptyState title="No GMs yet" body="Add the semester's GM sessions. They stay hidden from teams until published." />
{:else}
	<ol class="list">
		{#each data.lessons as l, i (l.id)}
			<li class:draft={!l.published}>
				<span class="gm">GM{l.gmNumber}</span>
				<div class="main">
					<div class="row">
						<strong>{l.title}</strong>
						{#if l.published}<Badge tone="green">Published</Badge>{:else}<Badge>Draft</Badge>{/if}
						{#if l.relatedPhase}<Badge tone="blue">{phaseMeta(l.relatedPhase as PhaseKey).label}</Badge>{/if}
					</div>
					<p>{l.scheduledDate ? fmtDate(l.scheduledDate) : 'No date set'} · {l.topics.join(', ') || 'No topics yet'}</p>
				</div>
				<div class="acts">
					<form method="POST" action="?/move" use:enhance>
						<input type="hidden" name="id" value={l.id} /><input type="hidden" name="otherId" value={data.lessons[i - 1]?.id ?? ''} />
						<button class="icon-btn" type="submit" disabled={i === 0} aria-label="Move GM{l.gmNumber} earlier"><ArrowUp size={15} /></button>
					</form>
					<form method="POST" action="?/move" use:enhance>
						<input type="hidden" name="id" value={l.id} /><input type="hidden" name="otherId" value={data.lessons[i + 1]?.id ?? ''} />
						<button class="icon-btn" type="submit" disabled={i === data.lessons.length - 1} aria-label="Move GM{l.gmNumber} later"><ArrowDown size={15} /></button>
					</form>
					<form method="POST" action="?/publish" use:enhance>
						<input type="hidden" name="id" value={l.id} /><input type="hidden" name="published" value={l.published ? 'false' : 'true'} />
						<button class="icon-btn" type="submit" title={l.published ? 'Unpublish' : 'Publish'} aria-label={l.published ? `Unpublish GM${l.gmNumber}` : `Publish GM${l.gmNumber}`}>
							{#if l.published}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
						</button>
					</form>
					<a class="icon-btn" href="/admin/curriculum/{l.id}{q}" title="Edit" aria-label="Edit GM{l.gmNumber}"><Pencil size={15} /></a>
					<form method="POST" action="?/delete" use:enhance={confirmDelete}>
						<input type="hidden" name="id" value={l.id} />
						<button class="icon-btn danger" type="submit" title="Delete" aria-label="Delete GM{l.gmNumber}"><Trash2 size={15} /></button>
					</form>
				</div>
			</li>
		{/each}
	</ol>
{/if}

<style lang="scss">
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
	}
	li {
		@include card;
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		padding: var(--sp-3) var(--sp-4);
		flex-wrap: wrap;
		&.draft {
			background: var(--c-bg);
		}
	}
	.gm {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: var(--r-md);
		background: var(--tpc-gradient);
		font-family: var(--font-display);
		font-weight: 900;
	}
	.draft .gm {
		background: var(--c-surface-2);
		color: var(--c-text-muted);
	}
	.main {
		flex: 1;
		min-width: 220px;
		p {
			font-size: var(--fs-sm);
			color: var(--c-text-muted);
		}
	}
	.row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}
	.acts {
		display: flex;
		gap: 2px;
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
			background: var(--c-surface-2);
			color: var(--c-text);
		}
		&:disabled {
			opacity: 0.3;
			cursor: default;
		}
		&.danger:hover {
			background: var(--tint-red);
			color: var(--deep-red);
		}
	}
</style>
