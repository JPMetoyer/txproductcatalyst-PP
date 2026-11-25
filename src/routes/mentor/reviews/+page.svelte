<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import * as data from '$lib/data';
	import { fmtShort } from '$lib/utils/format';

	const teams = data.teamsForMentor(data.DEMO.mentorId);
	const milestones = data.getMilestones();
</script>

<svelte:head><title>Milestone reviews · TPC Studio</title></svelte:head>
<PageHeader title="Milestone reviews" subtitle="Four lightweight reviews per team. Click a cell to open the review." />

<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable region must be keyboard-reachable) -->
<div class="scroll" role="region" aria-label="Milestone review matrix" tabindex="0">
	<table>
		<thead>
			<tr>
				<th scope="col">Team</th>
				{#each milestones as m (m.id)}<th scope="col">M{m.number} · {m.title}<span>{fmtShort(m.targetDate)}</span></th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each teams as t (t.id)}
				<tr>
					<th scope="row"><a href="/mentor/teams/{t.id}">{t.name}</a></th>
					{#each milestones as m (m.id)}
						<td><a href="/mentor/teams/{t.id}?tab=review" aria-label="{t.name} {m.title}"><MilestoneStatusBadge status={data.getReview(t.id, m.id)?.status ?? 'upcoming'} /></a></td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.scroll {
		overflow-x: auto;
		@include card;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-sm);
	}
	th,
	td {
		padding: var(--sp-3) var(--sp-4);
		text-align: left;
		border-bottom: 1px solid var(--c-border);
		white-space: nowrap;
	}
	thead th {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
		background: var(--c-bg);
		span {
			display: block;
			font-weight: 400;
		}
	}
	tbody tr:last-child > * {
		border-bottom: 0;
	}
	a {
		text-decoration: none;
	}
	th a:hover {
		text-decoration: underline;
	}
</style>
