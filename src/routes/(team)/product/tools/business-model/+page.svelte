<script lang="ts">
	import { ArrowLeft, Info, Repeat, ArrowLeftRight, Building2, Receipt } from '@lucide/svelte';
	import SaveIndicator from '$lib/components/ui/SaveIndicator.svelte';
	import { calculate, money, type Assumptions } from '$lib/tools/business-model';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SaveState } from '$lib/types/domain';

	let { data } = $props();
	// svelte-ignore state_referenced_locally (editable copy seeded once from the saved scenario)
	let a = $state<Assumptions>(structuredClone(data.assumptions));
	// svelte-ignore state_referenced_locally
	let version = $state(data.version);
	let saveState = $state<SaveState>('idle');
	const r = $derived(calculate(a));
	const readonly = $derived(workspace.readonly);

	// Debounced autosave of the whole scenario, version-checked like documentation fields.
	let timer: ReturnType<typeof setTimeout> | undefined;
	let first = true;
	$effect(() => {
		const snapshot = JSON.stringify(a);
		if (first) {
			first = false;
			return;
		}
		if (readonly) return;
		saveState = 'saving';
		clearTimeout(timer);
		timer = setTimeout(() => save(snapshot), 900);
	});

	async function save(snapshot: string) {
		const res = await fetch('/api/product/business-model', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ productId: data.product.id, assumptions: JSON.parse(snapshot), expectedVersion: version })
		});
		const body = await res.json().catch(() => null);
		if (!res.ok) {
			saveState = 'error';
			return toast(body?.message ?? 'Could not save', 'error');
		}
		version = body.version;
		if (!body.ok) {
			first = true; // don't re-save the teammate's version we're about to load
			a = body.assumptions;
			saveState = 'saved';
			return toast('A teammate changed these assumptions at the same time — showing their latest version.', 'info', 8000);
		}
		saveState = 'saved';
	}

	const pct = (v: number) => `${v}%`;
</script>

<svelte:head><title>Business Model Studio · My Product · TPC Studio</title></svelte:head>

<a class="back" href="/product/monetize"><ArrowLeft size={16} aria-hidden="true" /> Monetize</a>
<div class="title">
	<div>
		<h2>Business Model Studio</h2>
		<p>Explore how your assumptions turn into revenue and costs. Saved automatically to your product workspace.</p>
	</div>
	<SaveIndicator state={saveState} />
</div>

<p class="disclaimer" role="note"><Info size={16} aria-hidden="true" /> <span><strong>Estimates, not forecasts.</strong> Every number below comes from your team's assumptions. Back the important ones with evidence in Monetize.</span></p>

<div class="layout">
	<fieldset class="inputs" disabled={readonly}>
		<section class="model" class:off={!a.subscription.enabled}>
			<header>
				<Repeat size={18} aria-hidden="true" />
				<h3>Subscription</h3>
				<label class="toggle"><input type="checkbox" bind:checked={a.subscription.enabled} /> Include</label>
			</header>
			{#if a.subscription.enabled}
				<div class="grid">
					<label><span>Potential customers</span><input type="number" min="0" step="1" bind:value={a.subscription.potentialCustomers} /></label>
					<label><span>Paying conversion rate (%)</span><input type="number" min="0" max="100" step="0.1" bind:value={a.subscription.conversionRate} /></label>
					<label><span>Monthly price ($)</span><input type="number" min="0" step="0.01" bind:value={a.subscription.monthlyPrice} /></label>
				</div>
				<p class="calc">{r.payingCustomers.toLocaleString()} paying customers → <strong>{money(r.subscriptionRevenue)}</strong> monthly recurring revenue</p>
			{/if}
		</section>

		<section class="model" class:off={!a.transaction.enabled}>
			<header>
				<ArrowLeftRight size={18} aria-hidden="true" />
				<h3>Transaction fees</h3>
				<label class="toggle"><input type="checkbox" bind:checked={a.transaction.enabled} /> Include</label>
			</header>
			{#if a.transaction.enabled}
				<div class="grid">
					<label><span>Monthly transactions</span><input type="number" min="0" step="1" bind:value={a.transaction.monthlyTransactions} /></label>
					<label><span>Average transaction value ($)</span><input type="number" min="0" step="0.01" bind:value={a.transaction.averageValue} /></label>
					<label><span>Platform fee (%)</span><input type="number" min="0" max="100" step="0.1" bind:value={a.transaction.feePercent} /></label>
				</div>
				<p class="calc">Transaction revenue: <strong>{money(r.transactionRevenue)}</strong> / month</p>
			{/if}
		</section>

		<section class="model" class:off={!a.licensing.enabled}>
			<header>
				<Building2 size={18} aria-hidden="true" />
				<h3>Licensing</h3>
				<label class="toggle"><input type="checkbox" bind:checked={a.licensing.enabled} /> Include</label>
			</header>
			{#if a.licensing.enabled}
				<div class="grid">
					<label><span>Paying organizations</span><input type="number" min="0" step="1" bind:value={a.licensing.organizations} /></label>
					<label><span>License price ($)</span><input type="number" min="0" step="0.01" bind:value={a.licensing.price} /></label>
					<label>
						<span>Billing frequency</span>
						<select bind:value={a.licensing.billing}>
							<option value="monthly">Monthly</option>
							<option value="quarterly">Quarterly</option>
							<option value="annual">Annual</option>
						</select>
					</label>
				</div>
				<p class="calc">Licensing revenue: <strong>{money(r.licensingRevenue)}</strong> / month</p>
			{/if}
		</section>

		<section class="model">
			<header>
				<Receipt size={18} aria-hidden="true" />
				<h3>Costs</h3>
			</header>
			<div class="grid">
				<label><span>Monthly fixed costs ($)</span><input type="number" min="0" step="0.01" bind:value={a.costs.fixedMonthly} /></label>
				<label><span>Other operating expenses ($/mo)</span><input type="number" min="0" step="0.01" bind:value={a.costs.otherMonthly} /></label>
				<label><span>Variable cost ($)</span><input type="number" min="0" step="0.01" bind:value={a.costs.variableCost} /></label>
				<label>
					<span>Variable cost is per…</span>
					<select bind:value={a.costs.variableBasis}>
						<option value="customer">Paying customer / organization</option>
						<option value="transaction">Transaction</option>
					</select>
				</label>
			</div>
		</section>

		<label class="notes"><span>Notes on your assumptions</span><textarea rows="3" bind:value={a.notes} maxlength="5000" placeholder="Where did these numbers come from? What would change them?"></textarea></label>
	</fieldset>

	<aside class="results" aria-live="polite">
		<h3>Estimated monthly picture</h3>
		<dl>
			<div><dt>Revenue</dt><dd>{money(r.monthlyRevenue)}</dd></div>
			<div><dt>Costs</dt><dd>{money(r.monthlyCosts)}</dd></div>
			<div class="total" class:neg={r.monthlySurplus < 0}>
				<dt>{r.monthlySurplus < 0 ? 'Deficit' : 'Surplus'}</dt>
				<dd>{money(Math.abs(r.monthlySurplus))}</dd>
			</div>
		</dl>
		{#if Object.keys(r.breakEven).length}
			<h4>Break-even</h4>
			<p class="hint">Volume each model would need on its own to cover fixed and other costs.</p>
			<ul>
				{#each Object.entries(r.breakEven) as [model, be] (model)}
					<li>
						<span class="model-name">{model}</span>
						{#if be.units !== null}
							<strong>{be.units.toLocaleString()}</strong> {be.label}
						{:else}
							<em>{be.reason}</em>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if a.subscription.enabled && a.subscription.conversionRate > 0 && r.breakEven.subscription?.units}
			<p class="hint">At {pct(a.subscription.conversionRate)} conversion, that's about {Math.ceil(r.breakEven.subscription.units / (a.subscription.conversionRate / 100)).toLocaleString()} potential customers.</p>
		{/if}
		<p class="hint foot">Products that create value through savings or risk reduction can use these numbers to estimate the value delivered to a customer instead.</p>
	</aside>
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
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--sp-3);
		margin: var(--sp-3) 0;
		h2 {
			font-size: var(--fs-lg);
		}
		p {
			color: var(--c-text-muted);
		}
	}
	.disclaimer {
		display: flex;
		gap: var(--sp-2);
		padding: var(--sp-3) var(--sp-4);
		border-radius: var(--r-md);
		background: var(--tint-orange);
		font-size: var(--fs-sm);
		margin-bottom: var(--sp-4);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
			color: var(--deep-orange);
		}
	}
	.layout {
		display: grid;
		gap: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1fr 320px;
		}
	}
	.inputs {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.model {
		@include card;
		padding: var(--sp-4) var(--sp-5);
		&.off {
			background: var(--c-bg);
		}
		header {
			display: flex;
			align-items: center;
			gap: var(--sp-2);
		}
		h3 {
			font-size: var(--fs-md);
			flex: 1;
		}
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		margin-top: var(--sp-3);
		@include up($bp-sm) {
			grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		}
	}
	label:not(.toggle) {
		display: flex;
		flex-direction: column;
		gap: 4px;
		span {
			font-size: var(--fs-xs);
			font-weight: 600;
			color: var(--c-text-muted);
		}
	}
	input[type='number'],
	select,
	textarea {
		padding: 8px 10px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		background: var(--c-surface);
		font-variant-numeric: tabular-nums;
		&:focus {
			@include focus-ring;
			outline-offset: 0;
		}
	}
	textarea {
		field-sizing: content;
		min-height: 70px;
	}
	.calc {
		margin-top: var(--sp-3);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		strong {
			color: var(--c-text);
		}
	}
	.notes {
		@include card;
		padding: var(--sp-4) var(--sp-5);
	}
	.results {
		@include card;
		padding: var(--sp-5);
		align-self: start;
		@include up($bp-lg) {
			position: sticky;
			top: 72px;
		}
		h3 {
			font-size: var(--fs-md);
			margin-bottom: var(--sp-3);
		}
		h4 {
			font-size: var(--fs-sm);
			margin-top: var(--sp-4);
		}
	}
	dl {
		margin: 0;
		display: grid;
		gap: var(--sp-2);
		div {
			display: flex;
			justify-content: space-between;
			font-variant-numeric: tabular-nums;
		}
		dt {
			color: var(--c-text-muted);
		}
		dd {
			margin: 0;
			font-weight: 600;
		}
		.total {
			padding-top: var(--sp-2);
			border-top: 1px solid var(--c-border);
			font-size: var(--fs-md);
			dd {
				color: var(--deep-green);
				font-family: var(--font-display);
				font-size: var(--fs-lg);
			}
			&.neg dd {
				color: var(--deep-red);
			}
		}
	}
	ul {
		list-style: none;
		margin: var(--sp-2) 0 0;
		padding: 0;
		display: grid;
		gap: 6px;
		font-size: var(--fs-sm);
	}
	.model-name {
		display: inline-block;
		min-width: 92px;
		text-transform: capitalize;
		color: var(--c-text-muted);
	}
	em {
		color: var(--deep-orange);
		font-style: normal;
		font-size: var(--fs-xs);
	}
	.hint {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		margin-top: 4px;
	}
	.foot {
		margin-top: var(--sp-4);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
	}
</style>
