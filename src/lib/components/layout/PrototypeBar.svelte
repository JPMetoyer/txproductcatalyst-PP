<!-- Prototype-only role switcher. Delete when real auth lands (Phase 1). -->
<script lang="ts">
	import { page } from '$app/state';
	const roles = [
		{ href: '/home', label: 'Team', prefix: '' },
		{ href: '/mentor', label: 'Mentor', prefix: '/mentor' },
		{ href: '/admin', label: 'Admin', prefix: '/admin' }
	];
	const active = $derived(
		page.url.pathname.startsWith('/mentor') ? 'Mentor' : page.url.pathname.startsWith('/admin') ? 'Admin' : 'Team'
	);
</script>

<div class="pb" aria-label="Prototype role switcher">
	<span class="tag">Prototype</span>
	{#each roles as r}
		<a href={r.href} class:on={active === r.label}>{r.label}</a>
	{/each}
</div>

<style lang="scss">
	.pb {
		position: fixed;
		bottom: var(--sp-4);
		left: 50%;
		transform: translateX(-50%);
		z-index: 90;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		border-radius: 999px;
		background: var(--tpc-ink);
		box-shadow: var(--shadow-lg);
		font-size: var(--fs-xs);
	}
	.tag {
		padding: 0 10px;
		color: var(--tpc-orange);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	a {
		padding: 5px 12px;
		border-radius: 999px;
		color: #c9cbe0;
		text-decoration: none;
		font-weight: 600;
		&:hover {
			color: #fff;
		}
		&.on {
			background: #fff;
			color: var(--tpc-ink);
		}
	}
</style>
