<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, ArrowUp, ArrowDown, Trash2, Pencil } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { CAREER_SECTIONS, type CareerItem, type CareerSection } from '$lib/config/career';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	let editing = $state<string | null>(null); // item id, or `new:<section>`
	let busy = $state(false);

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
			if (result.type === 'success') editing = null;
		};
	};
	const confirmDelete: SubmitFunction = (input) => {
		if (!confirm('Delete this item?')) input.cancel();
		return submit(input);
	};
	const itemsIn = (s: CareerSection) => data.items.filter((i) => i.section === s);
</script>

{#snippet editor(item: CareerItem | null, section: CareerSection)}
	<form method="POST" action="?/save" use:enhance={submit} class="form">
		<input type="hidden" name="id" value={item?.id ?? ''} />
		<label>
			<span>Section</span>
			<select name="section" value={item?.section ?? section}>{#each CAREER_SECTIONS as s (s.key)}<option value={s.key}>{s.label}</option>{/each}</select>
		</label>
		<label><span>Title / question *</span><input name="title" value={item?.title ?? ''} required maxlength="300" /></label>
		<label><span>Details (optional)</span><textarea name="body" rows="4" maxlength="5000">{item?.body ?? ''}</textarea></label>
		<label><span>Link (optional)</span><input name="url" type="url" value={item?.url ?? ''} placeholder="https://" /></label>
		<div class="row">
			<Button size="sm" variant="ghost" onclick={() => (editing = null)}>Cancel</Button>
			<Button size="sm" variant="primary" type="submit" disabled={busy}>Save</Button>
		</div>
	</form>
{/snippet}

<svelte:head><title>Career Center · Admin · TPC Studio</title></svelte:head>
<PageHeader title="Career Center" subtitle="Shared career resources every team sees. Teams can copy items but never store private career documents here." />

{#each CAREER_SECTIONS as s (s.key)}
	{@const list = itemsIn(s.key)}
	<section class="sec">
		<header>
			<div><h2>{s.label}</h2><p>{s.blurb}</p></div>
			<Button size="sm" icon={Plus} onclick={() => (editing = `new:${s.key}`)}>Add</Button>
		</header>
		{#if editing === `new:${s.key}`}<div class="new">{@render editor(null, s.key)}</div>{/if}
		<ul>
			{#each list as item, i (item.id)}
				<li>
					{#if editing === item.id}
						{@render editor(item, s.key)}
					{:else}
						<div class="text"><strong>{item.title}</strong>{#if item.body}<p>{item.body}</p>{/if}</div>
						<div class="acts">
							<form method="POST" action="?/move" use:enhance><input type="hidden" name="id" value={item.id} /><input type="hidden" name="otherId" value={list[i - 1]?.id ?? ''} /><button class="icon-btn" disabled={i === 0} aria-label="Move up"><ArrowUp size={14} /></button></form>
							<form method="POST" action="?/move" use:enhance><input type="hidden" name="id" value={item.id} /><input type="hidden" name="otherId" value={list[i + 1]?.id ?? ''} /><button class="icon-btn" disabled={i === list.length - 1} aria-label="Move down"><ArrowDown size={14} /></button></form>
							<button class="icon-btn" onclick={() => (editing = item.id)} aria-label="Edit"><Pencil size={14} /></button>
							<form method="POST" action="?/delete" use:enhance={confirmDelete}><input type="hidden" name="id" value={item.id} /><button class="icon-btn danger" aria-label="Delete"><Trash2 size={14} /></button></form>
						</div>
					{/if}
				</li>
			{:else}
				<li class="empty">Nothing here yet.</li>
			{/each}
		</ul>
	</section>
{/each}

<style lang="scss">
	.sec {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		margin-bottom: var(--sp-4);
		header {
			display: flex;
			justify-content: space-between;
			gap: var(--sp-3);
			margin-bottom: var(--sp-3);
			h2 {
				font-size: var(--fs-md);
			}
			p {
				font-size: var(--fs-sm);
				color: var(--c-text-muted);
			}
		}
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		gap: var(--sp-3);
		padding: var(--sp-3) 0;
		border-top: 1px solid var(--c-border);
		&.empty {
			font-size: var(--fs-sm);
			color: var(--c-text-faint);
		}
	}
	.text {
		flex: 1;
		min-width: 0;
		font-size: var(--fs-sm);
		p {
			white-space: pre-wrap;
			color: var(--c-text-muted);
			margin-top: 4px;
		}
	}
	.acts {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}
	.new {
		padding: var(--sp-3);
		border-radius: var(--r-md);
		background: var(--c-bg);
		margin-bottom: var(--sp-2);
	}
	.form {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			span {
				font-size: var(--fs-xs);
				font-weight: 600;
			}
		}
		input,
		select,
		textarea {
			padding: 7px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			field-sizing: content;
			min-height: 36px;
		}
	}
	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--sp-2);
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 0;
		border-radius: var(--r-sm);
		background: none;
		color: var(--c-text-muted);
		cursor: pointer;
		&:hover:not(:disabled) {
			background: var(--c-surface-2);
		}
		&:disabled {
			opacity: 0.3;
		}
		&.danger:hover {
			background: var(--tint-red);
			color: var(--deep-red);
		}
	}
</style>
