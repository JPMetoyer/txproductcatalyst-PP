<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Archive, Play } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge, { type Tone } from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate } from '$lib/utils/format';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	let creating = $state(false);
	let busy = $state(false);
	const tone: Record<string, Tone> = { active: 'green', upcoming: 'blue', archived: 'neutral' };
	const countOf = (id: string) => data.counts.find((c) => c.id === id)!;
	const activeSem = $derived(data.semesters.find((s) => s.status === 'active'));

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success', 5000);
	});
	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			busy = false;
			if (result.type === 'success') creating = false;
		};
	};
	const confirmArchive: SubmitFunction = (input) => {
		if (!confirm('Archive this semester? Teams keep all documentation and can still sign in, but everything becomes read-only.')) input.cancel();
		return submit(input);
	};
</script>

<svelte:head><title>Semester settings · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Semester settings" subtitle="Semesters move from upcoming → active → archived. Archived documentation stays available, read-only.">
	{#snippet actions()}<Button variant="primary" icon={Plus} onclick={() => (creating = true)}>New semester</Button>{/snippet}
</PageHeader>

<p class="links">Set the GM schedule in <a href="/admin/curriculum">Curriculum</a> and review dates in <a href="/admin/milestones">Milestones</a>.</p>

{#if data.semesters.length === 0}
	<EmptyState title="No semesters yet" body="Create your first semester to start adding challenges and teams." />
{:else}
	<div class="list">
		{#each data.semesters as s (s.id)}
			{@const c = countOf(s.id)}
			<article class={s.status}>
				<form method="POST" action="?/update" use:enhance={submit} class="form">
					<input type="hidden" name="id" value={s.id} />
					<div class="title-row">
						<Badge tone={tone[s.status]} dot>{s.status}</Badge>
						<span class="counts">{c.teams} teams · {c.challenges} challenges · {c.lessons} GMs · {c.milestones} milestones</span>
					</div>
					<div class="grid">
						<label><span>Name</span><input name="name" value={s.name} required maxlength="80" disabled={s.status === 'archived'} /></label>
						<label><span>Theme</span><input name="theme" value={s.theme} maxlength="120" disabled={s.status === 'archived'} /></label>
						<label><span>Start date</span><input type="date" name="startDate" value={s.start_date} required disabled={s.status === 'archived'} /></label>
						<label><span>End date</span><input type="date" name="endDate" value={s.end_date} required disabled={s.status === 'archived'} /></label>
					</div>
					<label class="check">
						<input type="checkbox" name="publicMarketplace" checked={s.public_marketplace} disabled={s.status === 'archived'} />
						Public read-only Challenge Marketplace (anyone with the link can browse published challenges)
					</label>
					{#if s.status !== 'archived'}
						<div class="actions"><Button size="sm" variant="primary" type="submit" disabled={busy}>Save</Button></div>
					{:else}
						<p class="muted">Archived {fmtDate(s.end_date)}. Settings are locked.</p>
					{/if}
				</form>
				<div class="lifecycle">
					{#if s.status === 'upcoming'}
						<form method="POST" action="?/activate" use:enhance={submit}>
							<input type="hidden" name="id" value={s.id} />
							<Button size="sm" icon={Play} type="submit" disabled={busy || !!activeSem}>Make active</Button>
						</form>
						{#if activeSem}<p class="muted">Archive {activeSem.name} first.</p>{/if}
					{:else if s.status === 'active'}
						<form method="POST" action="?/archive" use:enhance={confirmArchive}>
							<input type="hidden" name="id" value={s.id} />
							<Button size="sm" variant="danger" icon={Archive} type="submit" disabled={busy}>Archive semester</Button>
						</form>
					{/if}
				</div>
			</article>
		{/each}
	</div>
{/if}

<Modal open={creating} title="New semester" onclose={() => (creating = false)}>
	<form id="new-sem" method="POST" action="?/create" use:enhance={submit} class="form">
		<div class="grid">
			<label><span>Name</span><input name="name" required maxlength="80" placeholder="Fall 2027" /></label>
			<label><span>Theme</span><input name="theme" maxlength="120" /></label>
			<label><span>Start date</span><input type="date" name="startDate" required /></label>
			<label><span>End date</span><input type="date" name="endDate" required /></label>
		</div>
		<label>
			<span>Start from</span>
			<select name="copyFrom">
				<option value="">Blank semester</option>
				{#each data.semesters as s (s.id)}<option value={s.id}>Copy challenges, curriculum and milestones from {s.name}</option>{/each}
			</select>
		</label>
		<p class="muted">New semesters start as <strong>upcoming</strong>. Copied content is unpublished and its dates are cleared.</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (creating = false)}>Cancel</Button>
		<Button variant="primary" type="submit" form="new-sem" disabled={busy}>Create semester</Button>
	{/snippet}
</Modal>

<style lang="scss">
	.links {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		margin: calc(var(--sp-3) * -1) 0 var(--sp-4);
	}
	.list {
		display: grid;
		gap: var(--sp-4);
	}
	article {
		@include card;
		padding: var(--sp-5);
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1fr 200px;
		}
		&.active {
			border-color: var(--tpc-blue);
			box-shadow: 0 0 0 3px var(--tint-blue);
		}
		&.archived {
			background: var(--c-bg);
		}
	}
	.title-row {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		flex-wrap: wrap;
	}
	.counts {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
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
		select {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			&:disabled {
				background: var(--c-surface-2);
			}
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		@include up($bp-sm) {
			grid-template-columns: 1fr 1fr;
		}
	}
	.check {
		flex-direction: row !important;
		align-items: center;
		gap: var(--sp-2) !important;
		font-size: var(--fs-sm);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
	}
	.lifecycle {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
		align-items: flex-start;
	}
	.muted {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
</style>
