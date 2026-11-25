<!-- Placeholder mascot. Replace with official TPC capybara art (see docs/PLAN.md Q8). -->
<script lang="ts">
	let { size = 96, mood = 'happy' }: { size?: number; mood?: 'happy' | 'party' | 'think' } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" class="capy">
	{#if mood === 'party'}
		<path d="M44 30 L54 8 L62 30 Z" fill="var(--tpc-pink)" />
		<circle cx="54" cy="8" r="3.5" fill="var(--tpc-orange)" />
	{/if}
	<ellipse cx="62" cy="76" rx="44" ry="30" fill="#b98a5e" />
	<ellipse cx="44" cy="54" rx="28" ry="24" fill="#c99a6b" />
	<ellipse cx="30" cy="34" rx="6" ry="5" fill="#a87a50" />
	<ellipse cx="56" cy="34" rx="6" ry="5" fill="#a87a50" />
	<rect x="14" y="52" width="26" height="20" rx="10" fill="#a87a50" />
	<ellipse cx="18" cy="58" rx="2" ry="1.6" fill="#5b3d26" />
	<ellipse cx="28" cy="58" rx="2" ry="1.6" fill="#5b3d26" />
	{#if mood === 'think'}
		<path d="M36 46 h8" stroke="var(--tpc-ink)" stroke-width="3" stroke-linecap="round" />
		<path d="M52 46 h8" stroke="var(--tpc-ink)" stroke-width="3" stroke-linecap="round" />
		<circle cx="96" cy="26" r="4" fill="var(--tpc-lavender)" />
		<circle cx="106" cy="14" r="6" fill="var(--tpc-lavender)" />
	{:else}
		<circle cx="40" cy="46" r="3.5" fill="var(--tpc-ink)" />
		<circle cx="56" cy="46" r="3.5" fill="var(--tpc-ink)" />
	{/if}
	<circle cx="66" cy="56" r="5" fill="var(--tpc-pink)" opacity="0.45" />
	<rect x="38" y="96" width="10" height="14" rx="5" fill="#a87a50" />
	<rect x="82" y="96" width="10" height="14" rx="5" fill="#a87a50" />
	<circle cx="50" cy="26" r="7" fill="var(--tpc-orange)" />
	<circle cx="50" cy="26" r="3" fill="#fff6e6" />
</svg>

<style>
	.capy {
		flex-shrink: 0;
	}
</style>
