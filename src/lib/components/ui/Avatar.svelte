<script lang="ts">
	let { name, size = 28 }: { name: string; size?: number } = $props();
	const initials = $derived(
		name
			.split(/\s+/)
			.map((s) => s[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
	const hues = ['blue', 'pink', 'orange', 'lavender'];
	const hue = $derived(hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length]);
</script>

<span class="av {hue}" style:width="{size}px" style:height="{size}px" style:font-size="{size * 0.4}px" title={name}>{initials}</span>

<style lang="scss">
	.av {
		display: inline-grid;
		place-items: center;
		border-radius: 50%;
		font-weight: 700;
		flex-shrink: 0;
		border: 2px solid var(--c-surface);
	}
	.blue { background: var(--tint-blue); color: var(--deep-blue); }
	.pink { background: var(--tint-pink); color: var(--deep-pink); }
	.orange { background: var(--tint-orange); color: var(--deep-orange); }
	.lavender { background: var(--tint-lavender); color: var(--deep-lavender); }
</style>
