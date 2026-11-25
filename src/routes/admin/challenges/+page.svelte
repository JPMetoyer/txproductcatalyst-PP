<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, ArrowUp, ArrowDown, Pencil, Eye, EyeOff, Trash2, ExternalLink } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ChallengeIcon from '$lib/components/ui/ChallengeIcon.svelte';
	import SemesterPicker from '$lib/components/ui/SemesterPicker.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
	const confirmDelete: SubmitFunction = (input) => {
		if (!confirm('Delete this challenge permanently? This cannot be undone.')) input.cancel();
	};
	const q = $derived(data.current ? `?semester=${data.current.id}` : '');
</script>

<svelte:head><title>Challenge Marketplace · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Challenge Marketplace" subtitle="Experience-based challenges for {data.current?.name ?? 'this semester'}. Describe experiences, not solutions.">
	{#snippet actions()}
		<SemesterPicker semesters={data.semesters} current={data.current} />
		{#if data.current}<Button variant="primary" icon={Plus} href="/admin/challenges/new{q}">New challenge</Button>{/if}
	{/snippet}
</PageHeader>

{#if !data.current}
	<EmptyState title="No semester yet" body="Create a semester first.">
		<Button variant="primary" href="/admin/semester">Semester settings</Button>
	</EmptyState>
{:else if data.challenges.length === 0}
	<EmptyState title="No challenges yet" body="Add challenges teams can choose from. They stay hidden until you publish them." />
{:else}
	<ol class="list">
		{#each data.challenges as c, i (c.id)}
			<li class:draft={!c.published}>
				<span class="icon {c.accent}"><ChallengeIcon icon={c.icon} size={20} /></span>
				<div class="main">
					<div class="row">
						<strong>{c.title}</strong>
						<span class="code">{c.code}</span>
						{#if c.published}<Badge tone="green">Published</Badge>{:else}<Badge>Draft</Badge>{/if}
						{#if data.assigned[c.id]}<Badge tone="blue">{data.assigned[c.id]} team{data.assigned[c.id] > 1 ? 's' : ''}</Badge>{/if}
					</div>
					<p>{c.summary || 'No summary yet.'}</p>
				</div>
				<div class="acts">
					<form method="POST" action="?/move" use:enhance>
						<input type="hidden" name="id" value={c.id} />
						<input type="hidden" name="otherId" value={data.challenges[i - 1]?.id ?? ''} />
						<button class="icon-btn" type="submit" disabled={i === 0} aria-label="Move {c.title} up"><ArrowUp size={15} /></button>
					</form>
					<form method="POST" action="?/move" use:enhance>
						<input type="hidden" name="id" value={c.id} />
						<input type="hidden" name="otherId" value={data.challenges[i + 1]?.id ?? ''} />
						<button class="icon-btn" type="submit" disabled={i === data.challenges.length - 1} aria-label="Move {c.title} down"><ArrowDown size={15} /></button>
					</form>
					<form method="POST" action="?/publish" use:enhance>
						<input type="hidden" name="id" value={c.id} />
						<input type="hidden" name="published" value={c.published ? 'false' : 'true'} />
						<button class="icon-btn" type="submit" aria-label={c.published ? `Unpublish ${c.title}` : `Publish ${c.title}`} title={c.published ? 'Unpublish' : 'Publish'}>
							{#if c.published}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
						</button>
					</form>
					{#if c.published}<a class="icon-btn" href="/challenges/{c.id}" target="_blank" aria-label="Preview {c.title}" title="Preview"><ExternalLink size={15} /></a>{/if}
					<a class="icon-btn" href="/admin/challenges/{c.id}{q}" aria-label="Edit {c.title}" title="Edit"><Pencil size={15} /></a>
					<form method="POST" action="?/delete" use:enhance={confirmDelete}>
						<input type="hidden" name="id" value={c.id} />
						<button class="icon-btn danger" type="submit" aria-label="Delete {c.title}" title="Delete"><Trash2 size={15} /></button>
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
	.icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--r-md);
		flex-shrink: 0;
		background: var(--tint-blue);
		color: var(--deep-blue);
		&.pink { background: var(--tint-pink); color: var(--deep-pink); }
		&.orange { background: var(--tint-orange); color: var(--deep-orange); }
		&.lavender { background: var(--tint-lavender); color: var(--deep-lavender); }
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
	.code {
		font-size: var(--fs-xs);
		color: var(--c-text-faint);
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
