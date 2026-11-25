<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import TeamCard from '$lib/components/product/TeamCard.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Assigned teams · TPC Studio</title></svelte:head>
<PageHeader title="Assigned teams" subtitle="You can view documentation and leave feedback for these teams only." />
{#if data.teams.length}
	<div class="teams">
		{#each data.teams as t (t.id)}<TeamCard team={t} href="/mentor/teams/{t.id}" />{/each}
	</div>
{:else}
	<EmptyState title="No teams assigned yet" body="The Academics Committee assigns teams to mentors. They'll show up here." />
{/if}

<style lang="scss">
	.teams {
		display: grid;
		gap: var(--sp-3);
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
</style>
