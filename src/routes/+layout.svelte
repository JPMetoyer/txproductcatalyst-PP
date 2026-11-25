<script lang="ts">
	import '$lib/styles/global.scss';
	let { children } = $props();
</script>

<svelte:head>
	<title>TPC Studio</title>
</svelte:head>

{@render children()}
