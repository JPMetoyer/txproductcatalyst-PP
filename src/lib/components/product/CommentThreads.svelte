<script lang="ts">
	import { MessageSquare, Check, RotateCcw, Reply } from '@lucide/svelte';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { fmtShort } from '$lib/utils/format';

	let { fieldKey, label }: { fieldKey: string; label: string } = $props();

	const threads = $derived(workspace.threads(fieldKey));
	const open = $derived(threads.filter((t) => !t.root.resolved));
	const resolved = $derived(threads.filter((t) => t.root.resolved));
	let showResolved = $state(false);
	let composing = $state(false);
	let draft = $state('');
	let replyTo = $state<string | null>(null);
	let reply = $state('');
	let busy = $state(false);

	async function start(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		if (await workspace.addComment(fieldKey, draft)) {
			draft = '';
			composing = false;
		}
		busy = false;
	}
	async function sendReply(e: SubmitEvent, parentId: string) {
		e.preventDefault();
		busy = true;
		if (await workspace.addComment(fieldKey, reply, parentId)) {
			reply = '';
			replyTo = null;
		}
		busy = false;
	}
	const day = (iso: string) => fmtShort(iso.slice(0, 10));
	const who = (c: { authorName: string; authorRole: string | null }) => (c.authorRole === 'team' ? c.authorName.replace(/^Team /, '') + ' (team)' : c.authorName);
</script>

{#snippet thread(t: (typeof threads)[number])}
	<div class="thread" class:done={t.root.resolved}>
		{#each [t.root, ...t.replies] as c, i (c.id)}
			<div class="msg" class:reply={i > 0}>
				<p class="meta"><strong>{who(c)}</strong> · {day(c.createdAt)}</p>
				<p class="body">{c.body}</p>
			</div>
		{/each}
		{#if workspace.canComment}
			<div class="actions">
				{#if !t.root.resolved}
					<button type="button" onclick={() => (replyTo = replyTo === t.root.id ? null : t.root.id)}><Reply size={13} aria-hidden="true" /> Reply</button>
					<button type="button" onclick={() => workspace.setResolved(t.root.id, true)}><Check size={13} aria-hidden="true" /> Resolve</button>
				{:else}
					<span class="resolved-tag">Resolved {t.root.resolvedAt ? day(t.root.resolvedAt) : ''}</span>
					<button type="button" onclick={() => workspace.setResolved(t.root.id, false)}><RotateCcw size={13} aria-hidden="true" /> Reopen</button>
				{/if}
			</div>
			{#if replyTo === t.root.id}
				<form class="compose" onsubmit={(e) => sendReply(e, t.root.id)}>
					<label class="sr-only" for="reply-{t.root.id}">Reply</label>
					<!-- svelte-ignore a11y_autofocus -->
					<textarea id="reply-{t.root.id}" rows="2" bind:value={reply} placeholder="Write a reply…" autofocus maxlength="4000"></textarea>
					<div class="row">
						<button type="button" class="ghost" onclick={() => (replyTo = null)}>Cancel</button>
						<button type="submit" class="primary" disabled={busy || !reply.trim()}>Reply</button>
					</div>
				</form>
			{/if}
		{/if}
	</div>
{/snippet}

{#if threads.length || workspace.canStartThreads}
	<div class="threads" aria-label="Comments on {label}">
		{#each open as t (t.root.id)}{@render thread(t)}{/each}

		{#if resolved.length}
			<button type="button" class="toggle" onclick={() => (showResolved = !showResolved)} aria-expanded={showResolved}>
				{showResolved ? 'Hide' : 'Show'} {resolved.length} resolved
			</button>
			{#if showResolved}{#each resolved as t (t.root.id)}{@render thread(t)}{/each}{/if}
		{/if}

		{#if workspace.canStartThreads}
			{#if composing}
				<form class="compose" onsubmit={start}>
					<label class="sr-only" for="new-{fieldKey}">Comment on {label}</label>
					<!-- svelte-ignore a11y_autofocus -->
					<textarea id="new-{fieldKey}" rows="2" bind:value={draft} placeholder="Comment on “{label}”…" autofocus maxlength="4000"></textarea>
					<div class="row">
						<button type="button" class="ghost" onclick={() => (composing = false)}>Cancel</button>
						<button type="submit" class="primary" disabled={busy || !draft.trim()}>Comment</button>
					</div>
				</form>
			{:else}
				<button type="button" class="add" onclick={() => (composing = true)}><MessageSquare size={13} aria-hidden="true" /> Comment</button>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	.threads {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.thread {
		border-radius: var(--r-md);
		background: var(--tint-lavender);
		padding: var(--sp-2) var(--sp-3);
		font-size: var(--fs-sm);
		&.done {
			background: var(--c-surface-2);
			color: var(--c-text-muted);
		}
	}
	.msg + .msg {
		margin-top: 6px;
	}
	.reply {
		padding-left: var(--sp-3);
		border-left: 2px solid rgba(90, 63, 174, 0.25);
	}
	.meta {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.body {
		white-space: pre-wrap;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		margin-top: 6px;
	}
	.actions button,
	.toggle,
	.add {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		border: 0;
		background: none;
		padding: 2px 4px;
		border-radius: 4px;
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--deep-lavender);
		cursor: pointer;
		&:hover {
			background: rgba(255, 255, 255, 0.6);
		}
	}
	.toggle,
	.add {
		align-self: flex-start;
		color: var(--c-text-muted);
		&:hover {
			color: var(--c-text);
			background: var(--c-surface-2);
		}
	}
	.resolved-tag {
		font-size: var(--fs-xs);
		color: var(--deep-green);
		font-weight: 600;
	}
	.compose {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 6px;
		textarea {
			width: 100%;
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-sm);
			background: var(--c-surface);
			field-sizing: content;
			min-height: 56px;
			font-size: var(--fs-sm);
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
		.row {
			display: flex;
			justify-content: flex-end;
			gap: 6px;
		}
		button {
			padding: 4px 12px;
			border-radius: var(--r-sm);
			font-size: var(--fs-xs);
			font-weight: 600;
			cursor: pointer;
			border: 1px solid var(--c-border-strong);
			background: var(--c-surface);
			&.primary {
				background: var(--tpc-ink);
				border-color: var(--tpc-ink);
				color: #fff;
				&:disabled {
					opacity: 0.4;
				}
			}
		}
	}
</style>
