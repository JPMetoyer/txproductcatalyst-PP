<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import DecisionLog from '$lib/components/product/DecisionLog.svelte';
	import { JOURNEY, phaseMeta } from '$lib/config/phases';
	import { today } from '$lib/data';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Decision } from '$lib/types/domain';

	let open = $state(false);
	let draft = $state<Decision | null>(null);

	function blank(): Decision {
		return { id: crypto.randomUUID(), productId: workspace.product!.id, title: '', date: today(), phase: 'discover', description: '', alternatives: '', evidence: '', reasoning: '', attribution: '', status: 'proposed' };
	}
	function edit(d?: Decision) {
		draft = d ? { ...d } : blank();
		open = true;
	}
	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!draft || !draft.title.trim()) return;
		workspace.upsertDecision($state.snapshot(draft));
		open = false;
		toast('Decision saved', 'success');
	}
	function remove() {
		if (!draft || !confirm('Delete this decision? Consider marking it “Reversed” instead to keep the history.')) return;
		workspace.removeDecision(draft.id);
		open = false;
	}
	const isNew = $derived(!!draft && !workspace.product?.decisions.some((d) => d.id === draft!.id));
</script>

<svelte:head><title>Decision log · My Product · TPC Studio</title></svelte:head>

<div class="intro">
	<div>
		<h2>Decision log</h2>
		<p>How your product evolved — and why. Great material for Demo Day and recruiting interviews.</p>
	</div>
	<Button variant="primary" icon={Plus} onclick={() => edit()}>Log a decision</Button>
</div>

<DecisionLog decisions={workspace.product?.decisions ?? []} onedit={edit} />

<Modal {open} title={isNew ? 'Log a decision' : 'Edit decision'} onclose={() => (open = false)} wide>
	{#if draft}
		<form id="decision-form" class="form" onsubmit={save}>
			<label class="wide"><span>Decision title *</span><input required bind:value={draft.title} placeholder="e.g. Pivot to property managers as paying customer" /></label>
			<label><span>Date</span><input type="date" bind:value={draft.date} /></label>
			<label>
				<span>Phase</span>
				<select bind:value={draft.phase}>{#each JOURNEY as p}<option value={p}>{phaseMeta(p).label}</option>{/each}</select>
			</label>
			<label>
				<span>Status</span>
				<select bind:value={draft.status}>
					<option value="proposed">Proposed</option>
					<option value="accepted">Accepted</option>
					<option value="reconsidering">Reconsidering</option>
					<option value="reversed">Reversed</option>
				</select>
			</label>
			<label><span>Attribution (optional)</span><input bind:value={draft.attribution} placeholder="Who drove this?" /></label>
			<label class="wide"><span>Description</span><textarea rows="2" bind:value={draft.description}></textarea></label>
			<label class="wide"><span>Alternatives considered</span><textarea rows="2" bind:value={draft.alternatives}></textarea></label>
			<label class="wide"><span>Supporting evidence</span><textarea rows="2" bind:value={draft.evidence}></textarea></label>
			<label class="wide"><span>Reasoning</span><textarea rows="2" bind:value={draft.reasoning}></textarea></label>
		</form>
	{/if}
	{#snippet footer()}
		{#if !isNew}<Button variant="danger" onclick={remove} class="mr-auto">Delete</Button>{/if}
		<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" type="submit" form="decision-form">Save decision</Button>
	{/snippet}
</Modal>

<style lang="scss">
	.intro {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--sp-3);
		margin-bottom: var(--sp-4);
		h2 {
			font-size: var(--fs-lg);
		}
		p {
			color: var(--c-text-muted);
		}
	}
	.form {
		display: grid;
		gap: var(--sp-3);
		@include up($bp-sm) {
			grid-template-columns: 1fr 1fr;
		}
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			&.wide {
				grid-column: 1 / -1;
			}
			span {
				font-size: var(--fs-sm);
				font-weight: 600;
			}
		}
		input,
		select,
		textarea {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			field-sizing: content;
			min-height: 38px;
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
	}
	:global(.mr-auto) {
		margin-right: auto;
	}
</style>
