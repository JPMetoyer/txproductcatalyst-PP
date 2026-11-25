<script lang="ts">
	import { ArrowLeft, Info } from '@lucide/svelte';
	import Badge, { type Tone } from '$lib/components/ui/Badge.svelte';
	import SaveIndicator from '$lib/components/ui/SaveIndicator.svelte';
	import { AREAS, STATUSES, type Assessment, type FeasibilityStatus } from '$lib/tools/feasibility';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SaveState } from '$lib/types/domain';

	let { data } = $props();
	// svelte-ignore state_referenced_locally (editable copies seeded once)
	let rows = $state<Assessment[]>(structuredClone(data.assessments));
	let states = $state<Record<string, SaveState>>({});
	const readonly = $derived(workspace.readonly);
	const timers = new Map<string, ReturnType<typeof setTimeout>>();
	const busy = new Set<string>();

	const counts = $derived(STATUSES.map((s) => ({ ...s, n: rows.filter((r) => r.status === s.key).length })).filter((s) => s.n > 0));
	const blockers = $derived(rows.filter((r) => r.status === 'blocker'));
	const label = (k: string) => AREAS.find((a) => a.key === k)!.label;

	function changed(row: Assessment, delay = 800) {
		if (readonly) return;
		states[row.area] = 'saving';
		clearTimeout(timers.get(row.area));
		timers.set(row.area, setTimeout(() => save(row), delay));
	}

	async function save(row: Assessment) {
		if (busy.has(row.area)) return changed(row, 300); // wait for the in-flight save so we never send a stale version
		busy.add(row.area);
		const sent = JSON.stringify([row.status, row.notes, row.evidence]);
		try {
			const res = await fetch('/api/product/feasibility', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ productId: data.product.id, area: row.area, status: row.status, notes: row.notes, evidence: row.evidence, expectedVersion: row.version })
			});
			const body = await res.json().catch(() => null);
			if (!res.ok) {
				states[row.area] = 'error';
				return toast(body?.message ?? 'Could not save', 'error');
			}
			if (body.ok) {
				row.version = body.version;
				states[row.area] = 'saved';
				if (JSON.stringify([row.status, row.notes, row.evidence]) !== sent) changed(row, 0);
			} else {
				Object.assign(row, body.current);
				states[row.area] = 'saved';
				toast(`A teammate updated “${label(row.area)}” at the same time — showing their version.`, 'info', 8000);
			}
		} finally {
			busy.delete(row.area);
		}
	}
	const tone = (s: FeasibilityStatus) => STATUSES.find((x) => x.key === s)!.tone as Tone;
</script>

<svelte:head><title>Feasibility Explorer · My Product · TPC Studio</title></svelte:head>

<a class="back" href="/product/scope"><ArrowLeft size={16} aria-hidden="true" /> Scope</a>
<div class="title">
	<div>
		<h2>Feasibility Explorer</h2>
		<p>Work through each area as you investigate. Saved automatically.</p>
	</div>
</div>

<div class="summary" role="note">
	<Info size={16} aria-hidden="true" />
	<div>
		<p>There's deliberately <strong>no overall score</strong>: checking boxes doesn't make a product feasible, evidence does.</p>
		<div class="chips">
			{#each counts as c (c.key)}<Badge tone={c.tone as Tone}>{c.n} {c.label.toLowerCase()}</Badge>{/each}
		</div>
		{#if blockers.length}<p class="blockers">Blockers to resolve or scope around: {blockers.map((b) => label(b.area)).join(', ')}.</p>{/if}
	</div>
</div>

<div class="areas">
	{#each rows as row (row.area)}
		{@const meta = AREAS.find((a) => a.key === row.area)!}
		<section class="area" class:blocker={row.status === 'blocker'} class:supported={row.status === 'supported'}>
			<header>
				<div>
					<h3>{meta.label}</h3>
					<p>{meta.prompt}</p>
				</div>
				<div class="right">
					{#if states[row.area]}<SaveIndicator state={states[row.area]} compact />{/if}
					<Badge tone={tone(row.status)} dot>{STATUSES.find((s) => s.key === row.status)!.label}</Badge>
				</div>
			</header>
			<fieldset disabled={readonly}>
				<div class="statuses" role="radiogroup" aria-label="Status for {meta.label}">
					{#each STATUSES as s (s.key)}
						<label class:on={row.status === s.key}>
							<input type="radio" name="status-{row.area}" value={s.key} bind:group={row.status} onchange={() => changed(row, 0)} />
							{s.label}
						</label>
					{/each}
				</div>
				<div class="grid">
					<label><span>Notes</span><textarea rows="2" bind:value={row.notes} oninput={() => changed(row)} maxlength="5000"></textarea></label>
					<label><span>Evidence</span><textarea rows="2" bind:value={row.evidence} oninput={() => changed(row)} maxlength="5000" placeholder="Docs, API terms, quotes, test results…"></textarea></label>
				</div>
			</fieldset>
		</section>
	{/each}
</div>

<style lang="scss">
	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-text-muted);
		text-decoration: none;
	}
	.title {
		margin: var(--sp-3) 0;
		h2 {
			font-size: var(--fs-lg);
		}
		p {
			color: var(--c-text-muted);
		}
	}
	.summary {
		display: flex;
		gap: var(--sp-2);
		padding: var(--sp-3) var(--sp-4);
		border-radius: var(--r-md);
		background: var(--tint-blue);
		font-size: var(--fs-sm);
		margin-bottom: var(--sp-4);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
			color: var(--deep-blue);
		}
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: var(--sp-2);
	}
	.blockers {
		margin-top: var(--sp-2);
		color: var(--deep-red);
		font-weight: 600;
	}
	.areas {
		display: grid;
		gap: var(--sp-3);
	}
	.area {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		border-left: 4px solid var(--c-border);
		&.blocker {
			border-left-color: var(--deep-red);
		}
		&.supported {
			border-left-color: #3fae6e;
		}
		header {
			display: flex;
			justify-content: space-between;
			gap: var(--sp-3);
			h3 {
				font-size: var(--fs-md);
			}
			p {
				font-size: var(--fs-sm);
				color: var(--c-text-muted);
			}
		}
	}
	.right {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-shrink: 0;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: var(--sp-3) 0 0;
		min-width: 0;
	}
	.statuses {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		label {
			display: inline-flex;
			align-items: center;
			padding: 4px 12px;
			border-radius: 999px;
			border: 1px solid var(--c-border-strong);
			font-size: var(--fs-xs);
			font-weight: 600;
			cursor: pointer;
			input {
				position: absolute;
				opacity: 0;
				pointer-events: none;
			}
			&:focus-within {
				@include focus-ring;
			}
			&.on {
				background: var(--tpc-ink);
				border-color: var(--tpc-ink);
				color: #fff;
			}
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		margin-top: var(--sp-3);
		@include up($bp-md) {
			grid-template-columns: 1fr 1fr;
		}
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			span {
				font-size: var(--fs-xs);
				font-weight: 600;
				color: var(--c-text-muted);
			}
		}
		textarea {
			padding: 8px 10px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			field-sizing: content;
			min-height: 60px;
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
	}
</style>
