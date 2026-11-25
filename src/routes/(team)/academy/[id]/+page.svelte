<script lang="ts">
	import LessonDetail from '$lib/components/product/LessonDetail.svelte';
	let { data } = $props();
</script>

<svelte:head><title>GM{data.lesson.gmNumber} {data.lesson.title} · PM Academy · TPC Studio</title></svelte:head>
<LessonDetail lesson={data.lesson} back="/academy" />
