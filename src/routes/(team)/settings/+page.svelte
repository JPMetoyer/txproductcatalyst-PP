<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Info } from '@lucide/svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let { data, form } = $props();
	const ctx = $derived(data.ctx!);
	let busy = $state(false);

	// Product name is a documentation field (ov.name), saved through the same conflict-safe endpoint.
	// svelte-ignore state_referenced_locally (seed editable copies once)
	let productName = $state(data.productName);
	// svelte-ignore state_referenced_locally
	let productVersion = $state(data.productVersion);

	async function saveProductName(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		const res = await fetch('/api/product/fields', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ productId: ctx.productId, key: 'ov.name', value: productName.trim(), evidence: null, expectedVersion: productVersion })
		});
		busy = false;
		const r = await res.json().catch(() => null);
		if (!res.ok) return toast(r?.message ?? 'Could not save', 'error');
		if (!r.ok) {
			productName = r.field.value;
			productVersion = r.field.version;
			return toast('A teammate renamed the product just now — showing their version.', 'info', 6000);
		}
		productVersion = r.field.version;
		toast('Product renamed', 'success');
	}

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) toast(form.error, 'error', 6000);
		else if ('ok' in form && form.ok) toast(form.ok, 'success');
	});
</script>

<svelte:head><title>Settings · TPC Studio</title></svelte:head>
<PageHeader title="Team settings" subtitle="Renaming never changes your login, links, or documentation." />

<div class="grid">
	<Card title="Team name">
		<form
			method="POST"
			action="?/renameTeam"
			use:enhance={() => {
				busy = true;
				return async ({ update }) => {
					await update({ reset: false });
					await invalidateAll();
					busy = false;
				};
			}}
		>
			<label for="team-name" class="sr-only">Team name</label>
			<input id="team-name" name="name" value={ctx.team.name} required minlength="2" maxlength="80" />
			<Button variant="primary" type="submit" disabled={busy}>Save</Button>
		</form>
	</Card>

	<Card title="Product name">
		<form onsubmit={saveProductName}>
			<label for="product-name" class="sr-only">Product name</label>
			<input id="product-name" bind:value={productName} maxlength="200" placeholder="e.g. Nestled" />
			<Button variant="primary" type="submit" disabled={busy}>Save</Button>
		</form>
		<p class="muted">Also editable in My Product → Overview.</p>
	</Card>

	<Card title="Roster">
		<ul class="people">
			{#each ctx.roster as m (m.id)}<li><Avatar name={m.name} size={26} /> {m.name}</li>{:else}<li class="muted">No roster yet.</li>{/each}
		</ul>
		<p class="muted">Roster changes are made by the Academics Committee.</p>
	</Card>

	<Card title="About this account">
		<p class="note"><Info size={16} aria-hidden="true" /> This login is <strong>shared by your whole team</strong>. Everything here is visible to teammates and your mentor. Keep personal notes and resumes outside Studio. To change the password, ask your Academics Committee contact.</p>
	</Card>
</div>

<style lang="scss">
	.grid {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-md) {
			grid-template-columns: 1fr 1fr;
		}
	}
	form {
		display: flex;
		gap: var(--sp-2);
		input {
			flex: 1;
			min-width: 0;
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
	}
	.muted {
		margin-top: var(--sp-2);
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.people {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
		li {
			display: flex;
			align-items: center;
			gap: var(--sp-2);
			font-size: var(--fs-sm);
		}
	}
	.note {
		display: flex;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
			color: var(--deep-lavender);
		}
	}
</style>
