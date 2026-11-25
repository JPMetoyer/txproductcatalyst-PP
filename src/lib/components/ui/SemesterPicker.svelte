<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { semesters, current }: { semesters: { id: string; name: string; status: string }[]; current: { id: string } | null } = $props();
	function pick(id: string) {
		const u = new URL(page.url);
		u.searchParams.set('semester', id);
		goto(u, { keepFocus: true, noScroll: true });
	}
</script>

{#if semesters.length > 1}
	<label class="picker">
		<span>Semester</span>
		<select value={current?.id} onchange={(e) => pick(e.currentTarget.value)}>
			{#each semesters as s (s.id)}<option value={s.id}>{s.name}{s.status !== 'active' ? ` (${s.status})` : ''}</option>{/each}
		</select>
	</label>
{/if}

<style lang="scss">
	.picker {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
		span {
			font-weight: 600;
		}
		select {
			padding: 6px 8px;
			border: 1px solid var(--c-border-strong);
			border-radius: var(--r-md);
			background: var(--c-surface);
		}
	}
</style>
