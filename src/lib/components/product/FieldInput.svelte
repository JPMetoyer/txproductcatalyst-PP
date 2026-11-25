<script lang="ts">
	import { TriangleAlert, ExternalLink } from '@lucide/svelte';
	import SaveIndicator from '$lib/components/ui/SaveIndicator.svelte';
	import CommentThreads from './CommentThreads.svelte';
	import { workspace } from '$lib/stores/workspace.svelte';
	import type { FieldDef } from '$lib/config/product-schema';
	import type { FieldEvidence } from '$lib/types/domain';

	interface Props {
		def: FieldDef;
		/** Mentor / admin view: render values without inputs. */
		readonly?: boolean;
	}
	let { def, readonly = false }: Props = $props();

	const id = $derived(`f-${def.key.replace('.', '-')}`);
	const value = $derived(workspace.value(def.key));
	const evidence = $derived(workspace.evidence(def.key));
	const status = $derived(workspace.status[def.key]);
	const str = $derived(typeof value === 'string' ? value : '');
	const arr = $derived(Array.isArray(value) ? (value as string[]) : []);
	const empty = $derived(Array.isArray(value) ? arr.length === 0 : !str.trim());

	function setEvidence(e: FieldEvidence) {
		workspace.set(def.key, value ?? '', evidence === e ? null : e);
	}
	function toggleOption(opt: string) {
		workspace.set(def.key, arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt]);
	}
</script>

<div class="field" class:wide={def.wide || def.type === 'multiselect'} class:conflict={status?.state === 'conflict'}>
	<div class="head">
		<label for={id}>{def.label}</label>
		<div class="right">
			{#if def.evidence}
				{#if readonly}
					{#if evidence}<span class="ev-tag {evidence}">{evidence === 'validated' ? 'Validated' : 'Assumption'}</span>{/if}
				{:else}
					<div class="evidence" role="group" aria-label="Evidence status for {def.label}">
						<button type="button" class:on={evidence === 'assumption'} class="a" aria-pressed={evidence === 'assumption'} onclick={() => setEvidence('assumption')}>Assumption</button>
						<button type="button" class:on={evidence === 'validated'} class="v" aria-pressed={evidence === 'validated'} onclick={() => setEvidence('validated')}>Validated</button>
					</div>
				{/if}
			{/if}
			{#if status && !readonly}<SaveIndicator state={status.state} compact />{/if}
		</div>
	</div>
	{#if def.prompt && !readonly}<p class="prompt" id="{id}-help">{def.prompt}</p>{/if}

	{#if readonly}
		<div class="ro" class:empty>
			{#if empty}Not started
			{:else if def.type === 'url'}<a href={str} target="_blank" rel="noopener noreferrer">{str} <ExternalLink size={12} /></a>
			{:else if def.type === 'multiselect'}{arr.join(', ')}
			{:else}{str}{/if}
		</div>
	{:else if def.type === 'textarea'}
		<textarea {id} rows="3" placeholder={def.placeholder ?? 'Start writing — incomplete is fine.'} value={str} oninput={(e) => workspace.set(def.key, e.currentTarget.value)} aria-describedby={def.prompt ? `${id}-help` : undefined}></textarea>
	{:else if def.type === 'select'}
		<select {id} value={str} onchange={(e) => workspace.set(def.key, e.currentTarget.value)}>
			<option value="">Choose…</option>
			{#each def.options ?? [] as o}<option value={o}>{o}</option>{/each}
		</select>
	{:else if def.type === 'multiselect'}
		<div class="options" role="group" aria-labelledby={id}>
			<span {id} class="sr-only">{def.label}</span>
			{#each def.options ?? [] as o}
				<label class="opt" class:on={arr.includes(o)}>
					<input type="checkbox" checked={arr.includes(o)} onchange={() => toggleOption(o)} />
					{o}
				</label>
			{/each}
		</div>
	{:else}
		<input {id} type={def.type === 'url' ? 'url' : def.type === 'number' ? 'number' : 'text'} placeholder={def.placeholder} value={str} oninput={(e) => workspace.set(def.key, e.currentTarget.value)} aria-describedby={def.prompt ? `${id}-help` : undefined} />
	{/if}

	{#if status?.state === 'conflict'}
		<div class="conflict-box" role="alert">
			<p><TriangleAlert size={14} aria-hidden="true" /> <strong>A teammate saved a newer version of this field.</strong> Your edit hasn't been saved.</p>
			<blockquote>{String(status.theirs ?? '')}</blockquote>
			<div class="btns">
				<button type="button" onclick={() => workspace.takeTheirs(def.key)}>Use theirs</button>
				<button type="button" class="primary" onclick={() => workspace.keepMine(def.key)}>Keep mine</button>
			</div>
		</div>
	{:else if status?.state === 'error'}
		<button type="button" class="retry" onclick={() => workspace.retry(def.key)}>Couldn't save. Retry</button>
	{/if}

	<CommentThreads fieldKey={def.key} label={def.label} />
</div>

<style lang="scss">
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		&.wide {
			grid-column: 1 / -1;
		}
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		min-height: 26px;
	}
	label {
		font-weight: 600;
		font-size: var(--fs-sm);
	}
	.right {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.prompt {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		margin-top: -4px;
	}
	textarea,
	input:not([type='checkbox']),
	select {
		width: 100%;
		padding: 9px 12px;
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		background: var(--c-surface);
		line-height: 1.5;
		transition: border-color var(--dur);
		&:hover {
			border-color: var(--c-border-strong);
		}
		&:focus {
			@include focus-ring;
			outline-offset: 0;
			border-color: transparent;
		}
		&::placeholder {
			color: var(--c-text-faint);
		}
	}
	textarea {
		resize: vertical;
		min-height: 84px;
		field-sizing: content;
		max-height: 420px;
	}
	.conflict textarea,
	.conflict input:not([type='checkbox']) {
		border-color: var(--tpc-orange);
	}
	.evidence {
		display: inline-flex;
		padding: 2px;
		border-radius: 999px;
		background: var(--c-surface-2);
		button {
			border: 0;
			background: none;
			padding: 2px 9px;
			border-radius: 999px;
			font-size: 11px;
			font-weight: 600;
			color: var(--c-text-faint);
			cursor: pointer;
			&:hover {
				color: var(--c-text);
			}
			&.a.on {
				background: var(--tint-orange);
				color: var(--deep-orange);
			}
			&.v.on {
				background: var(--tint-green);
				color: var(--deep-green);
			}
		}
	}
	.ev-tag {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 9px;
		border-radius: 999px;
		&.assumption {
			background: var(--tint-orange);
			color: var(--deep-orange);
		}
		&.validated {
			background: var(--tint-green);
			color: var(--deep-green);
		}
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.opt {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 999px;
		border: 1px solid var(--c-border-strong);
		font-size: var(--fs-sm);
		font-weight: 500;
		cursor: pointer;
		user-select: none;
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
	.ro {
		white-space: pre-wrap;
		padding: 10px 12px;
		border-radius: var(--r-md);
		background: var(--c-bg);
		font-size: var(--fs-sm);
		&.empty {
			color: var(--c-text-faint);
			font-style: italic;
		}
		a {
			word-break: break-all;
		}
	}
	.conflict-box {
		padding: var(--sp-3);
		border-radius: var(--r-md);
		background: var(--tint-orange);
		font-size: var(--fs-sm);
		p {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-wrap: wrap;
		}
		blockquote {
			margin: var(--sp-2) 0;
			padding: var(--sp-2) var(--sp-3);
			background: var(--c-surface);
			border-radius: var(--r-sm);
			white-space: pre-wrap;
		}
		.btns {
			display: flex;
			gap: var(--sp-2);
			justify-content: flex-end;
		}
		button {
			padding: 5px 12px;
			border-radius: var(--r-sm);
			border: 1px solid var(--c-border-strong);
			background: var(--c-surface);
			font-weight: 600;
			font-size: var(--fs-xs);
			cursor: pointer;
			&.primary {
				background: var(--tpc-ink);
				color: #fff;
				border-color: var(--tpc-ink);
			}
		}
	}
	.retry {
		align-self: flex-start;
		border: 0;
		background: none;
		color: var(--deep-red);
		font-weight: 600;
		font-size: var(--fs-xs);
		cursor: pointer;
		text-decoration: underline;
	}
</style>
