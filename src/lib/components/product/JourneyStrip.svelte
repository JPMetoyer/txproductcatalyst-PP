<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { JOURNEY, phaseMeta } from '$lib/config/phases';
	import type { JourneyPhase } from '$lib/types/domain';

	interface Props {
		current: JourneyPhase;
		started: JourneyPhase[];
		/** Link each step to the workspace section (team view). */
		linkBase?: string;
		compact?: boolean;
	}
	let { current, started, linkBase, compact = false }: Props = $props();
	const ci = $derived(JOURNEY.indexOf(current));
</script>

<ol class="journey" class:compact aria-label="Product journey">
	{#each JOURNEY as key, i (key)}
		{@const meta = phaseMeta(key)}
		{@const state = key === current ? 'current' : i < ci ? 'past' : started.includes(key) ? 'started' : 'future'}
		<li class={state} aria-current={key === current ? 'step' : undefined}>
			<svelte:element this={linkBase ? 'a' : 'div'} href={linkBase ? `${linkBase}/${key}` : undefined} class="step">
				<span class="node" aria-hidden="true">
					{#if state === 'past'}<Check size={12} strokeWidth={3} />{:else}{i + 1}{/if}
				</span>
				{#if !compact}
					<span class="label">{meta.label}</span>
					<span class="gm">{meta.gm}</span>
				{:else}
					<span class="sr-only">{meta.label}{key === current ? ' (current)' : ''}</span>
				{/if}
			</svelte:element>
		</li>
	{/each}
</ol>

<style lang="scss">
	.journey {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 4px;
		@include down($bp-sm) {
			&:not(.compact) {
				grid-template-columns: repeat(7, 72px);
				overflow-x: auto;
				padding-bottom: 4px;
			}
		}
	}
	li {
		position: relative;
		&:not(:last-child)::after {
			content: '';
			position: absolute;
			top: 13px;
			left: calc(50% + 16px);
			right: calc(-50% + 16px);
			height: 2px;
			background: var(--c-border);
			border-radius: 2px;
		}
		&.past::after {
			background: var(--tpc-blue);
		}
	}
	.compact li::after {
		top: 9px;
		left: calc(50% + 11px);
		right: calc(-50% + 11px);
	}
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		color: inherit;
		border-radius: var(--r-md);
		padding: 2px 0 4px;
	}
	a.step:hover .label {
		color: var(--c-text);
	}
	.node {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		font-size: var(--fs-xs);
		font-weight: 700;
		background: var(--c-surface-2);
		color: var(--c-text-muted);
		border: 2px solid var(--c-surface);
		box-shadow: 0 0 0 1px var(--c-border);
	}
	.compact .node {
		width: 20px;
		height: 20px;
		font-size: 10px;
	}
	.label {
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-text-muted);
	}
	.gm {
		font-size: 11px;
		color: var(--c-text-faint);
	}
	.past .node {
		background: var(--tpc-blue);
		color: var(--tpc-ink);
		box-shadow: none;
	}
	.started .node {
		background: var(--tint-blue);
		color: var(--deep-blue);
		box-shadow: 0 0 0 1px var(--tpc-blue);
	}
	.current .node {
		background: var(--tpc-ink);
		color: #fff;
		box-shadow: 0 0 0 3px var(--tint-pink), 0 0 0 4px var(--tpc-pink);
	}
	.current .label {
		color: var(--c-text);
	}
</style>
