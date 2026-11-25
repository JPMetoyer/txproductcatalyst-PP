<script lang="ts">
	import { Plus, Trash2, ChevronDown } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { TableDef } from '$lib/config/product-schema';

	let { def, readonly = false }: { def: TableDef; readonly?: boolean } = $props();
	const rows = $derived(workspace.logs(def.kind));
	let openId = $state<string | null>(null);

	function add() {
		const e = workspace.addLog(def.kind);
		openId = e.id;
	}
	function remove(id: string) {
		if (!confirm('Delete this entry? This cannot be undone.')) return;
		workspace.removeLog(id);
		toast('Entry deleted');
	}
	const summary = (data: Record<string, string>) =>
		[data[def.columns[0].key], data[def.columns[1].key]].filter(Boolean).join(' · ') || 'Untitled entry';
</script>

<section class="log">
	<header>
		<div>
			<h3>{def.title} <span class="count">{rows.length}</span></h3>
			<p>{def.description}</p>
		</div>
		{#if !readonly}<Button size="sm" icon={Plus} onclick={add}>{def.addLabel}</Button>{/if}
	</header>

	{#if rows.length === 0}
		<EmptyState title="Nothing logged yet" body={readonly ? 'The team hasn’t added entries here.' : `Click “${def.addLabel}” to record your first entry.`} mascot={false} />
	{:else if def.layout === 'grid'}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable region must be keyboard-reachable) -->
		<div class="scroll" role="region" aria-label={def.title} tabindex="0">
			<table>
				<thead>
					<tr>
						{#each def.columns as c}<th style:min-width={c.width ?? '160px'} scope="col">{c.label}</th>{/each}
						{#if !readonly}<th class="act"><span class="sr-only">Actions</span></th>{/if}
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr>
							{#each def.columns as c}
								<td>
									{#if readonly}
										<span class="ro">{r.data[c.key] ?? ''}</span>
									{:else if c.type === 'select'}
										<select value={r.data[c.key] ?? ''} onchange={(e) => workspace.updateLog(r.id, c.key, e.currentTarget.value)} aria-label={c.label}>
											<option value="">—</option>
											{#each c.options ?? [] as o}<option>{o}</option>{/each}
										</select>
									{:else}
										<textarea rows="1" value={r.data[c.key] ?? ''} oninput={(e) => workspace.updateLog(r.id, c.key, e.currentTarget.value)} aria-label={c.label}></textarea>
									{/if}
								</td>
							{/each}
							{#if !readonly}
								<td class="act"><button class="icon" onclick={() => remove(r.id)} aria-label="Delete row"><Trash2 size={14} /></button></td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<ul class="cards">
			{#each rows as r (r.id)}
				{@const isOpen = openId === r.id}
				<li class:open={isOpen}>
					<button class="summary" onclick={() => (openId = isOpen ? null : r.id)} aria-expanded={isOpen}>
						<span>{summary(r.data)}</span>
						{#if r.data.date}<span class="date">{r.data.date}</span>{/if}
						<ChevronDown size={16} class="chev" aria-hidden="true" />
					</button>
					{#if isOpen}
						<div class="entry">
							{#each def.columns as c}
								<label class:wide={c.type === 'textarea'}>
									<span>{c.label}</span>
									{#if readonly}
										<span class="ro">{r.data[c.key] || '—'}</span>
									{:else if c.type === 'textarea'}
										<textarea rows="2" value={r.data[c.key] ?? ''} oninput={(e) => workspace.updateLog(r.id, c.key, e.currentTarget.value)}></textarea>
									{:else if c.type === 'select'}
										<select value={r.data[c.key] ?? ''} onchange={(e) => workspace.updateLog(r.id, c.key, e.currentTarget.value)}>
											<option value="">—</option>
											{#each c.options ?? [] as o}<option>{o}</option>{/each}
										</select>
									{:else}
										<input type={c.type === 'date' ? 'date' : 'text'} value={r.data[c.key] ?? ''} oninput={(e) => workspace.updateLog(r.id, c.key, e.currentTarget.value)} />
									{/if}
								</label>
							{/each}
							{#if !readonly}
								<div class="entry-foot"><Button size="sm" variant="danger" icon={Trash2} onclick={() => remove(r.id)}>Delete entry</Button></div>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style lang="scss">
	.log {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sp-3);
		p {
			font-size: var(--fs-sm);
			color: var(--c-text-muted);
		}
	}
	h3 {
		font-size: var(--fs-md);
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.count {
		font-family: var(--font-body);
		font-size: var(--fs-xs);
		padding: 1px 8px;
		border-radius: 999px;
		background: var(--c-surface-2);
		color: var(--c-text-muted);
	}
	.scroll {
		overflow-x: auto;
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-sm);
	}
	th {
		text-align: left;
		padding: 8px 10px;
		background: var(--c-bg);
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--c-text-muted);
		border-bottom: 1px solid var(--c-border);
		white-space: nowrap;
	}
	td {
		border-bottom: 1px solid var(--c-border);
		border-right: 1px solid var(--c-border);
		vertical-align: top;
		padding: 0;
		&:last-child {
			border-right: 0;
		}
	}
	tr:last-child td {
		border-bottom: 0;
	}
	td textarea,
	td select {
		display: block;
		width: 100%;
		border: 0;
		background: transparent;
		padding: 8px 10px;
		resize: none;
		field-sizing: content;
		min-height: 38px;
		font-size: var(--fs-sm);
		&:focus {
			outline: 2px solid var(--c-focus);
			outline-offset: -2px;
			background: var(--c-surface);
		}
	}
	td .ro {
		display: block;
		padding: 8px 10px;
		white-space: pre-wrap;
	}
	.act {
		width: 40px;
		min-width: 40px;
		text-align: center;
	}
	.icon {
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		margin-top: 5px;
		border: 0;
		background: none;
		border-radius: var(--r-sm);
		color: var(--c-text-faint);
		cursor: pointer;
		&:hover {
			background: var(--tint-red);
			color: var(--deep-red);
		}
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
		li {
			border: 1px solid var(--c-border);
			border-radius: var(--r-md);
			background: var(--c-surface);
			&.open {
				border-color: var(--c-border-strong);
				box-shadow: var(--shadow-sm);
			}
		}
	}
	.summary {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		padding: 10px 14px;
		border: 0;
		background: none;
		text-align: left;
		font-weight: 600;
		font-size: var(--fs-sm);
		cursor: pointer;
		span:first-child {
			flex: 1;
			min-width: 0;
			@include truncate;
		}
		:global(.chev) {
			transition: transform var(--dur);
			color: var(--c-text-muted);
		}
	}
	.open .summary :global(.chev) {
		transform: rotate(180deg);
	}
	.date {
		font-weight: 500;
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	.entry {
		display: grid;
		gap: var(--sp-3);
		padding: 0 14px 14px;
		@include up($bp-sm) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
			&.wide {
				grid-column: 1 / -1;
			}
			> span:first-child {
				font-size: var(--fs-xs);
				font-weight: 600;
				color: var(--c-text-muted);
			}
		}
		input,
		textarea,
		select {
			width: 100%;
			padding: 7px 10px;
			border: 1px solid var(--c-border);
			border-radius: var(--r-sm);
			font-size: var(--fs-sm);
			field-sizing: content;
			min-height: 36px;
			resize: vertical;
			&:focus {
				@include focus-ring;
				outline-offset: 0;
			}
		}
		.ro {
			white-space: pre-wrap;
			font-size: var(--fs-sm);
		}
	}
	.entry-foot {
		grid-column: 1 / -1;
		display: flex;
		justify-content: flex-end;
	}
</style>
