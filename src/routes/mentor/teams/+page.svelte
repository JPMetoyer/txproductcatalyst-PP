<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import TeamCard from '$lib/components/product/TeamCard.svelte';
	import { DEMO, teamsForMentor } from '$lib/data';
	const teams = teamsForMentor(DEMO.mentorId);
</script>

<svelte:head><title>Assigned teams · TPC Studio</title></svelte:head>
<PageHeader title="Assigned teams" subtitle="You can view documentation and leave feedback for these teams only." />
<div class="teams">
	{#each teams as t (t.id)}<TeamCard team={t} href="/mentor/teams/{t.id}" />{/each}
</div>

<style lang="scss">
	.teams {
		display: grid;
		gap: var(--sp-3);
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
</style>
