<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, KeyRound, LogOut, Copy, TriangleAlert } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();

	let creating = $state(false);
	let busy = $state(false);
	let confirmTarget = $state<{ id: string; name: string; kind: 'reset' | 'revoke' } | null>(null);
	let shownCredentials = $state<{ team: string; login: string; password: string } | null>(null);

	// Show results of actions: credentials once in a modal, everything else as a toast.
	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('credentials' in form && form.credentials) {
			shownCredentials = form.credentials;
			creating = false;
		} else if ('message' in form && form.message) toast(form.message, 'success');
	});

	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
			confirmTarget = null;
		};
	};

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		toast('Copied', 'success');
	}
</script>

<svelte:head><title>Teams · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Teams" subtitle="Roster changes never delete or reset a team's product documentation.">
	{#snippet actions()}<Button variant="primary" icon={Plus} onclick={() => (creating = true)}>Create team</Button>{/snippet}
</PageHeader>

{#if data.teams.length === 0}
	<EmptyState title="No teams yet" body="Create a team to generate its shared login." />
{:else}
	<div class="list">
		{#each data.teams as t (t.id)}
			<article>
				<div class="main">
					<h2>{t.name}</h2>
					<p class="login">Login: <code>{t.login ?? '—'}</code></p>
					<div class="roster">
						{#each t.roster as m (m.id)}<span class="member"><Avatar name={m.name} size={22} />{m.name}</span>{:else}<span class="muted">No roster yet</span>{/each}
					</div>
				</div>
				<div class="assign">
					<form method="POST" action="?/assign" use:enhance={submit}>
						<input type="hidden" name="teamId" value={t.id} />
						<label>
							<span>Challenge</span>
							<select name="challengeId" value={t.challengeId ?? ''} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
								<option value="">Unassigned</option>
								{#each data.challenges as c (c.id)}<option value={c.id}>{c.title}</option>{/each}
							</select>
						</label>
					</form>
					<form method="POST" action="?/assign" use:enhance={submit}>
						<input type="hidden" name="teamId" value={t.id} />
						<label>
							<span>Mentor</span>
							<select name="mentorId" value={t.mentorId ?? ''} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
								<option value="">Unassigned</option>
								{#each data.mentors as m (m.id)}<option value={m.id}>{m.name}</option>{/each}
							</select>
						</label>
					</form>
				</div>
				<div class="acts">
					<Button size="sm" variant="ghost" icon={KeyRound} onclick={() => (confirmTarget = { id: t.id, name: t.name, kind: 'reset' })}>Reset credentials</Button>
					<Button size="sm" variant="ghost" icon={LogOut} onclick={() => (confirmTarget = { id: t.id, name: t.name, kind: 'revoke' })}>Revoke sessions</Button>
				</div>
			</article>
		{/each}
	</div>
{/if}

<Modal open={creating} title="Create team" onclose={() => (creating = false)}>
	<form id="create-team" method="POST" action="?/create" use:enhance={submit} class="form">
		<label><span>Team name</span><input name="name" required minlength="2" maxlength="80" /></label>
		<label>
			<span>Challenge (optional)</span>
			<select name="challengeId"><option value="">Assign later</option>{#each data.challenges as c (c.id)}<option value={c.id}>{c.title}</option>{/each}</select>
		</label>
		<label>
			<span>Mentor (optional)</span>
			<select name="mentorId"><option value="">Assign later</option>{#each data.mentors as m (m.id)}<option value={m.id}>{m.name}</option>{/each}</select>
		</label>
		<p class="note">A login and a strong password are generated on the server. The password is shown <strong>once</strong>; Studio never stores or displays it again.</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (creating = false)}>Cancel</Button>
		<Button variant="primary" type="submit" form="create-team" disabled={busy}>{busy ? 'Creating…' : 'Create team'}</Button>
	{/snippet}
</Modal>

<Modal open={!!confirmTarget} title={confirmTarget?.kind === 'reset' ? 'Reset credentials?' : 'Revoke all sessions?'} onclose={() => (confirmTarget = null)}>
	{#if confirmTarget}
		<p class="warn"><TriangleAlert size={16} aria-hidden="true" />
			{#if confirmTarget.kind === 'reset'}
				This generates a new password for <strong>{confirmTarget.name}</strong> and signs out every device using the old one. Use it when team membership changes.
			{:else}
				This signs out every device currently using <strong>{confirmTarget.name}</strong>'s account. The password stays the same.
			{/if}
		</p>
		<form id="confirm-form" method="POST" action={confirmTarget.kind === 'reset' ? '?/resetCredentials' : '?/revokeSessions'} use:enhance={submit}>
			<input type="hidden" name="teamId" value={confirmTarget.id} />
		</form>
	{/if}
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (confirmTarget = null)}>Cancel</Button>
		<Button variant="danger" type="submit" form="confirm-form" disabled={busy}>{confirmTarget?.kind === 'reset' ? 'Reset credentials' : 'Revoke sessions'}</Button>
	{/snippet}
</Modal>

<Modal open={!!shownCredentials} title="Share these credentials" onclose={() => (shownCredentials = null)}>
	{#if shownCredentials}
		<p>Send these to <strong>{shownCredentials.team}</strong> privately (e.g. a DM to one member). This password won't be shown again.</p>
		<dl class="creds">
			<div><dt>Login</dt><dd><code>{shownCredentials.login}</code><button onclick={() => copy(shownCredentials!.login)} aria-label="Copy login"><Copy size={14} /></button></dd></div>
			<div><dt>Password</dt><dd><code>{shownCredentials.password}</code><button onclick={() => copy(shownCredentials!.password)} aria-label="Copy password"><Copy size={14} /></button></dd></div>
		</dl>
	{/if}
	{#snippet footer()}<Button variant="primary" onclick={() => (shownCredentials = null)}>I've saved them</Button>{/snippet}
</Modal>

<style lang="scss">
	.list {
		display: grid;
		gap: var(--sp-3);
	}
	article {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1.4fr 1fr auto;
			align-items: center;
		}
	}
	h2 {
		font-size: var(--fs-md);
	}
	.login {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		margin: 2px 0 var(--sp-2);
	}
	code {
		font-size: var(--fs-xs);
		background: var(--c-surface-2);
		padding: 1px 6px;
		border-radius: 4px;
	}
	.roster {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.member {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px 2px 2px;
		border-radius: 999px;
		background: var(--c-surface-2);
		font-size: var(--fs-xs);
	}
	.muted {
		font-size: var(--fs-xs);
		color: var(--c-text-faint);
	}
	.assign {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--sp-2);
		label {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
		}
		span {
			@include eyebrow;
			font-size: 11px;
		}
		select {
			width: 100%;
			padding: 6px 8px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-sm);
		}
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		@include up($bp-lg) {
			flex-direction: column;
			align-items: flex-start;
		}
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			font-weight: 600;
			font-size: var(--fs-sm);
		}
		input,
		select {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			font-weight: 400;
		}
	}
	.note {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}
	.warn {
		display: flex;
		gap: var(--sp-2);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
			color: var(--deep-orange);
		}
	}
	.creds {
		margin: var(--sp-4) 0 0;
		display: grid;
		gap: var(--sp-3);
		dt {
			@include eyebrow;
		}
		dd {
			margin: 4px 0 0;
			display: flex;
			align-items: center;
			gap: var(--sp-2);
		}
		code {
			font-size: var(--fs-md);
			padding: 4px 10px;
		}
		button {
			border: 0;
			background: none;
			cursor: pointer;
			color: var(--c-text-muted);
			display: grid;
			padding: 4px;
			border-radius: 4px;
			&:hover {
				background: var(--c-surface-2);
			}
		}
	}
</style>
