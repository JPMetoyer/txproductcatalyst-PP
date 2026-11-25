<script lang="ts">
	import { Plus, KeyRound, LogOut, Archive } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import * as data from '$lib/data';
	import { toast } from '$lib/stores/toast.svelte';

	const teams = data.getTeams();
	const challenges = data.getChallenges();
	const mentors = data.getMentors();
	let creating = $state(false);
	let name = $state('');

	function create(e: SubmitEvent) {
		e.preventDefault();
		creating = false;
		toast(`Team “${name}” created. Credentials generated — share them securely.`, 'success', 5000);
		name = '';
	}
</script>

<svelte:head><title>Teams · Admin · TPC Studio</title></svelte:head>

<PageHeader title="Teams" subtitle="Roster changes never delete or reset a team's product documentation.">
	{#snippet actions()}<Button variant="primary" icon={Plus} onclick={() => (creating = true)}>Create team</Button>{/snippet}
</PageHeader>

<div class="list">
	{#each teams as t (t.id)}
		{@const roster = data.getRoster(t.id)}
		<article>
			<div class="main">
				<h2>{t.name}</h2>
				<div class="roster">
					{#each roster as m (m.id)}<span class="member"><Avatar name={m.name} size={22} />{m.name}</span>{/each}
				</div>
			</div>
			<div class="assign">
				<label>
					<span>Challenge</span>
					<select value={t.challengeId ?? ''} onchange={() => toast('Challenge reassigned', 'success')}>
						<option value="">Unassigned</option>
						{#each challenges as c (c.id)}<option value={c.id}>{c.title}</option>{/each}
					</select>
				</label>
				<label>
					<span>Mentor</span>
					<select value={t.mentorIds[0] ?? ''} onchange={() => toast('Mentor reassigned', 'success')}>
						<option value="">Unassigned</option>
						{#each mentors as m (m.id)}<option value={m.id}>{m.displayName}</option>{/each}
					</select>
				</label>
			</div>
			<div class="acts">
				<Button size="sm" variant="ghost" icon={KeyRound} onclick={() => toast('New password generated (shown once)', 'success')}>Reset credentials</Button>
				<Button size="sm" variant="ghost" icon={LogOut} onclick={() => toast('All sessions revoked', 'success')}>Revoke sessions</Button>
				<Button size="sm" variant="ghost" icon={Archive} onclick={() => toast('Archive available in Phase 3')}>Archive</Button>
			</div>
		</article>
	{/each}
</div>

<Modal open={creating} title="Create team" onclose={() => (creating = false)}>
	<form id="create-team" onsubmit={create} class="form">
		<label><span>Team name</span><input required bind:value={name} /></label>
		<p class="note">A login and strong random password will be generated server-side. The password is shown once — Studio never stores or displays it again.</p>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (creating = false)}>Cancel</Button>
		<Button variant="primary" type="submit" form="create-team">Create team</Button>
	{/snippet}
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
		margin-bottom: var(--sp-2);
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
			padding: 6px 8px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-sm);
			min-width: 0;
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
		input {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
		}
	}
	.note {
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}
</style>
