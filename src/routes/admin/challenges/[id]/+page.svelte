<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ArrowLeft } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ChallengeCard from '$lib/components/ui/ChallengeCard.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Challenge, ChallengeIcon } from '$lib/types/domain';

	let { data, form } = $props();
	const c = $derived(data.challenge);
	const back = $derived(`/admin/challenges${page.url.searchParams.get('semester') ? `?semester=${page.url.searchParams.get('semester')}` : ''}`);
	const defaults = ['Demonstrate a meaningful customer problem.', 'Identify differentiation from existing alternatives.', 'Establish a realistic business or value-creation model.', 'Investigate technical feasibility.', 'Develop a testable MVP.'];

	// Live preview state (seeded once from the saved challenge).
	// svelte-ignore state_referenced_locally
	let title = $state(c?.title ?? '');
	// svelte-ignore state_referenced_locally
	let summary = $state(c?.summary ?? '');
	// svelte-ignore state_referenced_locally
	let icon = $state<ChallengeIcon>(c?.icon ?? 'home');
	// svelte-ignore state_referenced_locally
	let accent = $state<Challenge['accent']>(c?.accent ?? 'blue');
	// svelte-ignore state_referenced_locally
	let code = $state(c?.code ?? '');
	const preview = $derived({ ...(c ?? ({} as Challenge)), title: title || 'Challenge title', summary, icon, accent, code } as Challenge);
	let busy = $state(false);

	$effect(() => {
		if (form && 'error' in form && form.error) toast(form.error, 'error', 6000);
	});
</script>

<svelte:head><title>{c ? `Edit ${c.title}` : 'New challenge'} · Admin · TPC Studio</title></svelte:head>

<a class="back" href={back}><ArrowLeft size={16} aria-hidden="true" /> Challenges</a>
<h1>{c ? `Edit “${c.title}”` : 'New challenge'}</h1>
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
				<h2>Card</h2>
				<div class="grid">
					<label><span>Title *</span><input name="title" bind:value={title} required maxlength="120" /></label>
					<label><span>Unique ID *</span><input name="code" bind:value={code} required maxlength="20" placeholder="LM-09" /></label>
				</div>
				<label><span>Short description</span><input name="summary" bind:value={summary} maxlength="300" /></label>
				<div class="grid">
					<label>
						<span>Icon</span>
						<select name="icon" bind:value={icon}>{#each data.icons as i}<option value={i}>{i}</option>{/each}</select>
					</label>
					<label>
						<span>Accent color</span>
						<select name="accent" bind:value={accent}>{#each data.accents as a}<option value={a}>{a}</option>{/each}</select>
					</label>
				</div>
			</section>

			<section>
				<h2>Brief</h2>
				<label><span>The experience</span><textarea name="experience" rows="3">{c?.experience ?? ''}</textarea></label>
				<label><span>The mission</span><textarea name="mission" rows="3">{c?.mission ?? ''}</textarea></label>
				<p class="hint">For the lists below, put one item per line.</p>
				<label><span>Potential stakeholders</span><textarea name="stakeholders" rows="4">{c?.stakeholders.join('\n') ?? ''}</textarea></label>
				<label><span>Research considerations</span><textarea name="research" rows="4">{c?.researchConsiderations.join('\n') ?? ''}</textarea></label>
				<label><span>Project boundaries</span><textarea name="boundaries" rows="3">{c?.boundaries.join('\n') ?? ''}</textarea></label>
				<label><span>Expectations</span><textarea name="expectations" rows="5">{(c?.expectations ?? defaults).join('\n')}</textarea></label>
			</section>
		</div>

		<aside>
			<p class="lbl">Preview</p>
			<ChallengeCard challenge={preview} href="#preview" />
			<label class="check"><input type="checkbox" name="published" checked={c?.published ?? false} /> Published (visible to teams)</label>
			<Button variant="primary" type="submit" full disabled={busy}>{busy ? 'Saving…' : 'Save challenge'}</Button>
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
			grid-template-columns: 1fr 300px;
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
	.lbl {
		@include eyebrow;
	}
	.check {
		flex-direction: row;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--fs-sm);
	}
</style>
