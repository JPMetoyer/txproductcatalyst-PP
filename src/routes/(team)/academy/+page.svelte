<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import LessonList from '$lib/components/product/LessonList.svelte';
	let { data } = $props();
</script>

<svelte:head><title>PM Academy · TPC Studio</title></svelte:head>
<PageHeader title="PM Academy" subtitle="Every GM session, its key ideas, and where to apply them in your product. No quizzes, no grades." />
<LessonList lessons={data.lessons} today={data.today} />
