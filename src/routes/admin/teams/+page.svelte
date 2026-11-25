<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, KeyRound, LogOut, Copy, TriangleAlert, X, UserPlus } from '@lucide/svelte';
	import { JOURNEY, phaseMeta } from '$lib/config/phases';
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
	let memberTarget = $state<{ id: string; name: string; teamId: string; teamName: string } | null>(null);
	let moveTo = $state('');

	// Show results of actions: credentials once in a modal, everything else as a toast.
	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else {
			if ('message' in form && form.message) toast(form.message, 'success');
			if ('credentials' in form && form.credentials) {
				shownCredentials = form.credentials;
				creating = false;
			}
		}
	});

	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
			confirmTarget = null;
			memberTarget = null;
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
					<form class="rename" method="POST" action="?/rename" use:enhance={submit}>
						<input type="hidden" name="teamId" value={t.id} />
						<label class="sr-only" for="name-{t.id}">Team name</label>
						<input id="name-{t.id}" name="name" value={t.name} required minlength="2" maxlength="80" onchange={(e) => e.currentTarget.form?.requestSubmit()} />
					</form>
					<p class="login">Login: <code>{t.login ?? '—'}</code></p>
					<div class="roster">
						{#each t.roster as m (m.id)}
							<span class="member">
								<Avatar name={m.name} size={22} />{m.name}
								<button type="button" class="x" aria-label="Remove or move {m.name}" onclick={() => { memberTarget = { id: m.id, name: m.name, teamId: t.id, teamName: t.name }; moveTo = ''; }}><X size={12} /></button>
							</span>
						{:else}<span class="muted">No roster yet</span>{/each}
						<form class="add-member" method="POST" action="?/addMember" use:enhance={submit}>
							<input type="hidden" name="teamId" value={t.id} />
							<label class="sr-only" for="add-{t.id}">Add member to {t.name}</label>
							<input id="add-{t.id}" name="name" placeholder="Add member" maxlength="80" required />
							<button type="submit" aria-label="Add member"><UserPlus size={14} /></button>
						</form>
					</div>
				</div>
				<div class="assign">
					<form method="POST" action="?/phase" use:enhance={submit} class="span">
						<input type="hidden" name="teamId" value={t.id} />
						<label>
							<span>Phase <em>(calendar: {phaseMeta(data.recommended).label})</em></span>
							<select name="phase" value={t.currentPhase} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
								{#each JOURNEY as p}<option value={p}>{phaseMeta(p).label}</option>{/each}
							</select>
						</label>
					</form>
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

<Modal open={!!memberTarget} title={memberTarget ? `Change ${memberTarget.name}'s team` : ''} onclose={() => (memberTarget = null)}>
	{#if memberTarget}
		<form id="member-form" method="POST" action="?/changeMember" use:enhance={submit} class="form">
			<input type="hidden" name="memberId" value={memberTarget.id} />
			<label>
				<span>What should happen?</span>
				<select name="toTeamId" bind:value={moveTo}>
					<option value="">Remove from {memberTarget.teamName}</option>
					{#each data.teams.filter((x) => x.id !== memberTarget!.teamId) as o (o.id)}<option value={o.id}>Move to {o.name}</option>{/each}
				</select>
			</label>
			<p class="warn"><TriangleAlert size={16} aria-hidden="true" /> <span><strong>Recommended:</strong> reset {memberTarget.teamName}'s password and sign out all devices, so {memberTarget.name} can no longer open the shared account. The team's documentation is never deleted.</span></p>
			<label class="check"><input type="checkbox" name="rotate" checked /> Reset password and revoke sessions for {memberTarget.teamName}</label>
		</form>
	{/if}
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (memberTarget = null)}>Cancel</Button>
		<Button variant="primary" type="submit" form="member-form" disabled={busy}>{moveTo ? 'Move member' : 'Remove member'}</Button>
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
	.rename input {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--fs-md);
		border: 1px solid transparent;
		border-radius: var(--r-sm);
		padding: 2px 6px;
		margin-left: -6px;
		background: none;
		width: 100%;
		max-width: 320px;
		&:hover {
			border-color: var(--c-border);
		}
		&:focus {
			@include focus-ring;
			outline-offset: 0;
		}
	}
	.x {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
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
	.add-member {
		display: inline-flex;
		align-items: center;
		border: 1px dashed var(--c-border-strong);
		border-radius: 999px;
		padding: 0 2px 0 8px;
		input {
			border: 0;
			background: none;
			width: 110px;
			font-size: var(--fs-xs);
			padding: 3px 0;
			&:focus {
				outline: none;
			}
		}
		button {
			display: grid;
			place-items: center;
			width: 22px;
			height: 22px;
			border: 0;
			border-radius: 50%;
			background: none;
			cursor: pointer;
			color: var(--c-text-muted);
			&:hover {
				background: var(--c-surface-2);
			}
		}
		&:focus-within {
			@include focus-ring;
		}
	}
	.span {
		grid-column: 1 / -1;
	}
	em {
		font-style: normal;
		text-transform: none;
		letter-spacing: 0;
		font-weight: 500;
	}
	.check {
		flex-direction: row !important;
		align-items: center;
		gap: var(--sp-2) !important;
		font-weight: 500 !important;
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
