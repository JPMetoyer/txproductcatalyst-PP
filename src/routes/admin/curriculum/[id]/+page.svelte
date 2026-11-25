<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ArrowLeft } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { PHASES } from '$lib/config/phases';
	import { toast } from '$lib/stores/toast.svelte';

	let { data, form } = $props();
	const l = $derived(data.lesson);
	const back = $derived(`/admin/curriculum${page.url.searchParams.get('semester') ? `?semester=${page.url.searchParams.get('semester')}` : ''}`);
	let busy = $state(false);
	$effect(() => {
		if (form && 'error' in form && form.error) toast(form.error, 'error', 6000);
	});
	const res = $derived((l?.resources ?? []).map((r) => (r.title === r.url ? r.url : `${r.title} | ${r.url}`)).join('\n'));
</script>

<svelte:head><title>{l ? `Edit GM${l.gmNumber}` : 'New GM'} · Admin · TPC Studio</title></svelte:head>

<a class="back" href={back}><ArrowLeft size={16} aria-hidden="true" /> Curriculum</a>
<h1>{l ? `GM${l.gmNumber} — ${l.title}` : 'New GM'}</h1>
<p class="sub">{data.semester?.name}</p>

<form
	method="POST"
	action="?/save"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
		};
	}}
>
	<input type="hidden" name="semesterId" value={data.semester?.id} />
	<div class="layout">
		<div class="fields">
			<section>
				<h2>Session</h2>
				<div class="grid three">
					<label><span>GM number *</span><input type="number" name="gmNumber" min="1" max="20" value={l?.gmNumber ?? data.nextGm} required /></label>
					<label><span>Title *</span><input name="title" value={l?.title ?? ''} required maxlength="120" placeholder="DISCOVER IT" /></label>
					<label><span>Date</span><input type="date" name="date" value={l?.scheduledDate ?? ''} /></label>
				</div>
				<label><span>Description</span><textarea name="description" rows="2" maxlength="2000">{l?.description ?? ''}</textarea></label>
				<div class="grid">
					<label><span>Curriculum slide link</span><input type="url" name="slideUrl" value={l?.slideUrl ?? ''} placeholder="https://docs.google.com/presentation/…" /></label>
					<label>
						<span>Related workspace section</span>
						<select name="relatedPhase" value={l?.relatedPhase ?? ''}>
							<option value="">None</option>
							{#each PHASES as p (p.key)}<option value={p.key}>{p.label}</option>{/each}
						</select>
					</label>
				</div>
				<p class="hint">The related section links the GM to My Product and sets the team's calendar-recommended phase once the GM date passes.</p>
			</section>

			<section>
				<h2>Content</h2>
				<p class="hint">For lists, put one item per line.</p>
				<label><span>Topics (shown as tags)</span><textarea name="topics" rows="3">{l?.topics.join('\n') ?? ''}</textarea></label>
				<label><span>Learning objectives</span><textarea name="objectives" rows="3">{l?.objectives?.join('\n') ?? ''}</textarea></label>
				<label><span>Key concepts</span><textarea name="keyConcepts" rows="3">{l?.keyConcepts?.join('\n') ?? ''}</textarea></label>
				<label><span>Practical examples</span><textarea name="examples" rows="3">{l?.examples ?? ''}</textarea></label>
				<label><span>Team activity instructions</span><textarea name="activity" rows="3">{l?.activity ?? ''}</textarea></label>
				<label><span>Additional resources (one per line: <code>Title | https://link</code>)</span><textarea name="resources" rows="3">{res}</textarea></label>
			</section>
		</div>
		<aside>
			<label class="check"><input type="checkbox" name="published" checked={l?.published ?? false} /> Published (visible in PM Academy)</label>
			<Button variant="primary" type="submit" full disabled={busy}>{busy ? 'Saving…' : 'Save GM'}</Button>
			<Button variant="ghost" href={back} full>Cancel</Button>
		</aside>
	</div>
</form>

<style lang="scss">
	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--c-text-muted);
		text-decoration: none;
	}
	h1 {
		font-size: var(--fs-xl);
		margin-top: var(--sp-3);
	}
	.sub {
		color: var(--c-text-muted);
		margin-bottom: var(--sp-5);
	}
	.layout {
		display: grid;
		gap: var(--sp-5);
		@include up($bp-lg) {
			grid-template-columns: 1fr 240px;
		}
	}
	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}
	section {
		@include card;
		padding: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		h2 {
			font-size: var(--fs-md);
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-3);
		@include up($bp-sm) {
			grid-template-columns: 1fr 1fr;
		}
		&.three {
			@include up($bp-sm) {
				grid-template-columns: 110px 1fr 170px;
			}
		}
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		span {
			font-size: var(--fs-sm);
			font-weight: 600;
		}
	}
	input:not([type='checkbox']),
	select,
	textarea {
		padding: 8px 10px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		field-sizing: content;
		min-height: 38px;
		&:focus {
			@include focus-ring;
			outline-offset: 0;
		}
	}
	.hint {
		font-size: var(--fs-xs);
		color: var(--c-text-muted);
	}
	code {
		font-size: var(--fs-xs);
		background: var(--c-surface-2);
		padding: 1px 4px;
		border-radius: 3px;
	}
	aside {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		@include up($bp-lg) {
			position: sticky;
			top: var(--sp-5);
			align-self: start;
		}
	}
	.check {
		flex-direction: row;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}
</style>
