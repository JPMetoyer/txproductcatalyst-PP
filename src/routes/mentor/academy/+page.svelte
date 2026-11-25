<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import LessonList from '$lib/components/product/LessonList.svelte';
</script>

<svelte:head><title>PM Academy · TPC Studio</title></svelte:head>
<PageHeader title="PM Academy" subtitle="What your teams are learning each week." />
<LessonList linkToProduct={false} />
