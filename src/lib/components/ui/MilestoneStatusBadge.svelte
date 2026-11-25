<script lang="ts">
	import Badge, { type Tone } from './Badge.svelte';
	import type { MilestoneStatus } from '$lib/types/domain';
	let { status }: { status: MilestoneStatus } = $props();
	const map: Record<MilestoneStatus, [string, Tone]> = {
		upcoming: ['Upcoming', 'neutral'],
		ready: ['Ready for review', 'blue'],
		reviewed: ['Reviewed', 'green'],
		'follow-up': ['Follow-up needed', 'orange']
	};
</script>

<Badge tone={map[status][1]} dot>{map[status][0]}</Badge>
