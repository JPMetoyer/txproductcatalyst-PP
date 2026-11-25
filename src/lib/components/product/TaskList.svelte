<script lang="ts">
	import { Plus, Trash2, Pencil, Check, X } from '@lucide/svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtShort } from '$lib/utils/format';
	import type { Task, TeamMember } from '$lib/types/domain';

	let { tasks: initial, roster, teamId, today }: { tasks: Task[]; roster: TeamMember[]; teamId: string; today: string } = $props();

	// Prototype: local state. Phase 2: form actions against the `tasks` table.
	// svelte-ignore state_referenced_locally (intentional: seed local state once)
	let tasks = $state(initial.map((t) => ({ ...t })));
	let title = $state('');
	let assignee = $state('');
	let due = $state('');
	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let showDone = $state(false);

	const open = $derived(tasks.filter((t) => t.status === 'open').sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9')));
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const member = (id: string | null) => roster.find((m) => m.id === id);

	function add(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		tasks.push({ id: crypto.randomUUID(), teamId, title: title.trim(), assignedMemberId: assignee || null, dueDate: due || null, status: 'open' });
		title = '';
		due = '';
		assignee = '';
	}
	function toggle(t: Task) {
		t.status = t.status === 'open' ? 'done' : 'open';
		if (t.status === 'done') toast('Task completed', 'success');
	}
	function remove(t: Task) {
		tasks.splice(tasks.indexOf(t), 1);
		toast('Task deleted');
	}
	function startEdit(t: Task) {
		editingId = t.id;
		editTitle = t.title;
	}
	function saveEdit(t: Task) {
		if (editTitle.trim()) t.title = editTitle.trim();
		editingId = null;
	}
</script>

<form class="add" onsubmit={add}>
	<label class="sr-only" for="new-task">New task</label>
	<input id="new-task" class="title" placeholder="Add a task…" bind:value={title} />
	<div class="row">
		<label class="sr-only" for="new-assignee">Assign to</label>
		<select id="new-assignee" bind:value={assignee}>
			<option value="">Unassigned</option>
			{#each roster as m (m.id)}<option value={m.id}>{m.name}</option>{/each}
		</select>
		<label class="sr-only" for="new-due">Due date</label>
		<input id="new-due" type="date" bind:value={due} />
		<button class="add-btn" type="submit" aria-label="Add task" disabled={!title.trim()}><Plus size={16} /></button>
	</div>
</form>

{#if open.length === 0}
	<EmptyState title="No open tasks" body="Break your next milestone into small tasks and split them up." mascot={false} />
{:else}
	<ul class="tasks">
		{#each open as t (t.id)}
			{@const m = member(t.assignedMemberId)}
			{@const overdue = t.dueDate && t.dueDate < today}
			<li>
				<input type="checkbox" checked={false} onchange={() => toggle(t)} aria-label="Mark “{t.title}” complete" />
				{#if editingId === t.id}
					<!-- svelte-ignore a11y_autofocus -->
					<input class="edit" bind:value={editTitle} autofocus onkeydown={(e) => e.key === 'Enter' ? saveEdit(t) : e.key === 'Escape' && (editingId = null)} aria-label="Task title" />
					<button class="icon" onclick={() => saveEdit(t)} aria-label="Save"><Check size={14} /></button>
					<button class="icon" onclick={() => (editingId = null)} aria-label="Cancel"><X size={14} /></button>
				{:else}
					<span class="t">{t.title}</span>
					{#if t.dueDate}<span class="due" class:overdue>{fmtShort(t.dueDate)}</span>{/if}
					{#if m}<Avatar name={m.name} size={24} />{/if}
					<span class="actions">
						<button class="icon" onclick={() => startEdit(t)} aria-label="Edit “{t.title}”"><Pencil size={14} /></button>
						<button class="icon" onclick={() => remove(t)} aria-label="Delete “{t.title}”"><Trash2 size={14} /></button>
					</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

{#if done.length}
	<button class="toggle-done" onclick={() => (showDone = !showDone)} aria-expanded={showDone}>
		{showDone ? 'Hide' : 'Show'} {done.length} completed
	</button>
	{#if showDone}
		<ul class="tasks done">
			{#each done as t (t.id)}
				<li>
					<input type="checkbox" checked onchange={() => toggle(t)} aria-label="Reopen “{t.title}”" />
					<span class="t">{t.title}</span>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style lang="scss">
	.add {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: var(--sp-3);
		padding: var(--sp-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		background: var(--c-bg);
		&:focus-within {
			border-color: var(--c-border-strong);
		}
	}
	.title {
		border: 0;
		background: none;
		padding: 4px 6px;
		&:focus {
			outline: none;
		}
	}
	.row {
		display: flex;
		gap: 6px;
		select,
		input {
			height: 30px;
			border: 1px solid var(--c-border);
			border-radius: var(--r-sm);
			background: var(--c-surface);
			font-size: var(--fs-xs);
			padding: 0 6px;
			min-width: 0;
		}
		select {
			flex: 1;
		}
	}
	.add-btn {
		width: 30px;
		height: 30px;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: var(--r-sm);
		background: var(--tpc-ink);
		color: #fff;
		cursor: pointer;
		&:disabled {
			opacity: 0.35;
			cursor: default;
		}
	}
	.tasks {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		padding: 8px 4px;
		border-bottom: 1px solid var(--c-border);
		font-size: var(--fs-sm);
		&:last-child {
			border-bottom: 0;
		}
		&:hover .actions,
		&:focus-within .actions {
			opacity: 1;
		}
	}
	input[type='checkbox'] {
		width: 16px;
		height: 16px;
		accent-color: var(--tpc-ink);
		flex-shrink: 0;
	}
	.t {
		flex: 1;
		min-width: 0;
	}
	.done .t {
		text-decoration: line-through;
		color: var(--c-text-faint);
	}
	.edit {
		flex: 1;
		height: 28px;
		padding: 0 6px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-sm);
	}
	.due {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		white-space: nowrap;
		&.overdue {
			color: var(--deep-red);
			font-weight: 600;
		}
	}
	.actions {
		display: flex;
		opacity: 0;
		transition: opacity var(--dur);
		@media (hover: none) {
			opacity: 1;
		}
	}
	.icon {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border: 0;
		background: none;
		border-radius: var(--r-sm);
		color: var(--c-text-muted);
		cursor: pointer;
		&:hover {
			background: var(--c-surface-2);
			color: var(--c-text);
		}
	}
	.toggle-done {
		margin-top: var(--sp-2);
		border: 0;
		background: none;
		color: var(--c-text-muted);
		font-size: var(--fs-xs);
		font-weight: 600;
		cursor: pointer;
		padding: 4px 0;
		&:hover {
			color: var(--c-text);
		}
	}
</style>
