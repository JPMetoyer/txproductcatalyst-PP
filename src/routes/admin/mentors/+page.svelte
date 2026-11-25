<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, KeyRound, UserX, UserCheck, Copy } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { fmtDate } from '$lib/utils/format';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();
	let creating = $state(false);
	let editing = $state<string | null>(null);
	let busy = $state(false);
	let shown = $state<{ team: string; login: string; password: string } | null>(null);

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else {
			if ('ok' in form && form.ok) toast(form.ok, 'success');
			if ('credentials' in form && form.credentials) {
				shown = form.credentials;
				creating = false;
			}
		}
	});
	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			busy = false;
			if (result.type === 'success') editing = null;
		};
	};
	const teamName = (id: string) => data.teams.find((t) => t.id === id)?.name ?? '';
</script>

<svelte:head><title>Mentors · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Mentors" subtitle="Professional Committee members who review assigned teams. Deactivating keeps their past reviews.">
	{#snippet actions()}<Button variant="primary" icon={Plus} onclick={() => (creating = true)}>Add mentor</Button>{/snippet}
</PageHeader>

{#if data.mentors.length === 0}
	<EmptyState title="No mentors yet" body="Add a mentor to generate their login." />
{:else}
	<div class="list">
		{#each data.mentors as m (m.id)}
			<article class:inactive={!m.active}>
				<div class="main">
					<h2>{m.name} {#if !m.active}<Badge tone="neutral">Deactivated</Badge>{/if}</h2>
					<p class="meta">Login: <code>{m.login ?? '—'}</code> · {m.reviewCount} review{m.reviewCount === 1 ? '' : 's'}{m.lastReviewAt ? ` · last ${fmtDate(m.lastReviewAt.slice(0, 10))}` : ''}</p>
					<div class="chips">
						{#each m.teamIds as id}<Badge tone="blue">{teamName(id)}</Badge>{:else}<span class="muted">No teams assigned</span>{/each}
						{#if m.active}<button class="link" onclick={() => (editing = editing === m.id ? null : m.id)}>{editing === m.id ? 'Cancel' : 'Assign teams'}</button>{/if}
					</div>
					{#if editing === m.id}
						<form class="assign" method="POST" action="?/assign" use:enhance={submit}>
							<input type="hidden" name="id" value={m.id} />
							{#each data.teams as t (t.id)}
								<input type="hidden" name="allTeamIds" value={t.id} />
								<label><input type="checkbox" name="teamIds" value={t.id} checked={m.teamIds.includes(t.id)} /> {t.name}</label>
							{/each}
							<Button size="sm" variant="primary" type="submit" disabled={busy}>Save assignments</Button>
						</form>
					{/if}
				</div>
				<div class="acts">
					{#if m.active}
						<form method="POST" action="?/reset" use:enhance={submit}>
							<input type="hidden" name="id" value={m.id} />
							<Button size="sm" variant="ghost" icon={KeyRound} type="submit">Reset password</Button>
						</form>
					{/if}
					<form
						method="POST"
						action="?/setActive"
						use:enhance={(input) => {
							if (m.active && !confirm(`Deactivate ${m.name}? They'll be signed out and can't log in until reactivated.`)) input.cancel();
							return submit(input);
						}}
					>
						<input type="hidden" name="id" value={m.id} />
						<input type="hidden" name="active" value={m.active ? 'false' : 'true'} />
						<Button size="sm" variant="ghost" icon={m.active ? UserX : UserCheck} type="submit">{m.active ? 'Deactivate' : 'Reactivate'}</Button>
					</form>
				</div>
			</article>
		{/each}
	</div>
{/if}

<Modal open={creating} title="Add mentor" onclose={() => (creating = false)}>
	<form id="create-mentor" method="POST" action="?/create" use:enhance={submit} class="form">
		<label><span>Full name</span><input name="name" required minlength="2" maxlength="80" /></label>
		<p class="muted">A login like <code>mentor-first-last</code> and a strong password are generated. The password is shown once.</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (creating = false)}>Cancel</Button>
		<Button variant="primary" type="submit" form="create-mentor" disabled={busy}>Create mentor</Button>
	{/snippet}
</Modal>

<Modal open={!!shown} title="Share these credentials" onclose={() => (shown = null)}>
	{#if shown}
		<p>Send these to <strong>{shown.team}</strong> privately. This password won't be shown again.</p>
		<dl class="creds">
			<div><dt>Login</dt><dd><code>{shown.login}</code><button onclick={() => navigator.clipboard.writeText(shown!.login)} aria-label="Copy login"><Copy size={14} /></button></dd></div>
			<div><dt>Password</dt><dd><code>{shown.password}</code><button onclick={() => navigator.clipboard.writeText(shown!.password)} aria-label="Copy password"><Copy size={14} /></button></dd></div>
		</dl>
	{/if}
	{#snippet footer()}<Button variant="primary" onclick={() => (shown = null)}>I've saved them</Button>{/snippet}
</Modal>

<style lang="scss">
	.list {
		display: grid;
		gap: var(--sp-3);
	}
	article {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--sp-4);
		&.inactive {
			opacity: 0.7;
		}
	}
	.main {
		flex: 1;
		min-width: 240px;
	}
	h2 {
		font-size: var(--fs-md);
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.meta {
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
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}
	.link {
		border: 0;
		background: none;
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--deep-blue);
		cursor: pointer;
		text-decoration: underline;
	}
	.assign {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2) var(--sp-4);
		align-items: center;
		margin-top: var(--sp-3);
		padding: var(--sp-3);
		border-radius: var(--r-md);
		background: var(--c-bg);
		label {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: var(--fs-sm);
		}
	}
	.acts {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
	}
	.muted {
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
			font-weight: 600;
			font-size: var(--fs-sm);
		}
		input {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
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
		}
	}
</style>
