<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import LessonList from '$lib/components/product/LessonList.svelte';
	import { getLessons, today } from '$lib/data'; // Phase 3: load from the database
</script>

<svelte:head><title>PM Academy · TPC Studio</title></svelte:head>
<PageHeader title="PM Academy" subtitle="What your teams are learning each week." />
<LessonList lessons={getLessons()} today={today()} linkToProduct={false} />
