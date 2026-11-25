<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import ChallengeIcon from './ChallengeIcon.svelte';
	import Badge from './Badge.svelte';
	import type { Challenge } from '$lib/types/domain';
	let { challenge, assigned = false, href }: { challenge: Challenge; assigned?: boolean; href: string } = $props();
</script>

<a class="cc {challenge.accent}" class:assigned {href}>
	<div class="top">
		<span class="icon"><ChallengeIcon icon={challenge.icon} /></span>
		<span class="code">{challenge.code}</span>
	</div>
	<h3>{challenge.title}</h3>
	<p>{challenge.summary}</p>
	<div class="bottom">
		{#if assigned}<Badge tone="ink">Your challenge</Badge>{:else}<span></span>{/if}
		<span class="go">Read brief <ArrowRight size={14} aria-hidden="true" /></span>
	</div>
</a>

<style lang="scss">
	.cc {
		--accent: var(--tpc-blue);
		--tint: var(--tint-blue);
		--deep: var(--deep-blue);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
		padding: var(--sp-5);
		border-radius: var(--r-lg);
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		text-decoration: none;
		color: inherit;
		overflow: hidden;
		transition:
			transform var(--dur) var(--ease),
			box-shadow var(--dur) var(--ease),
			border-color var(--dur) var(--ease);
		&::before {
			content: '';
			position: absolute;
			inset: 0 0 auto 0;
			height: 4px;
			background: var(--accent);
		}
		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
			border-color: var(--accent);
		}
		&.assigned {
			border-color: var(--accent);
			box-shadow: 0 0 0 3px var(--tint);
		}
	}
	.pink { --accent: var(--tpc-pink); --tint: var(--tint-pink); --deep: var(--deep-pink); }
	.orange { --accent: var(--tpc-orange); --tint: var(--tint-orange); --deep: var(--deep-orange); }
	.lavender { --accent: var(--tpc-lavender); --tint: var(--tint-lavender); --deep: var(--deep-lavender); }
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: var(--r-md);
		background: var(--tint);
		color: var(--deep);
	}
	.code {
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--c-text-faint);
		font-variant-numeric: tabular-nums;
	}
	h3 {
		font-size: var(--fs-lg);
		margin-top: var(--sp-2);
	}
	p {
		color: var(--c-text-muted);
		font-size: var(--fs-sm);
		flex: 1;
	}
	.bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--sp-2);
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--deep);
	}
</style>
