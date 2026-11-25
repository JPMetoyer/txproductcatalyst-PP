<script lang="ts">
	import { enhance } from '$app/forms';
	import { Lock, Info } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Capybara from '$lib/components/ui/Capybara.svelte';
	import { getSemester } from '$lib/data';

	let { data, form } = $props();
	const semester = getSemester();
	let loading = $state(false);
</script>

<svelte:head><title>Sign in · TPC Studio</title></svelte:head>

<div class="page">
	<aside class="art">
		<div class="art-inner">
			<span class="logo"><img src="/tpc.png" alt="" width="32" height="32" /> TPC Studio</span>
			<div class="pitch">
				<span class="pill">{semester.name} · {semester.theme}</span>
				<h1>Where your product takes shape.</h1>
				<p>Discover a real problem, build something people want, and tell its story at Demo Day — all in one workspace.</p>
			</div>
			<div class="capy"><Capybara size={150} /></div>
		</div>
	</aside>

	<main>
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update({ reset: false });
					loading = false;
				};
			}}
		>
			<h2>Sign in</h2>
			<p class="muted">Use the login your Academics Committee sent your team.</p>
			{#if data.next}<input type="hidden" name="next" value={data.next} />{/if}

			<label>
				<span>Team login</span>
				<input name="login" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" value={form?.login ?? ''} placeholder="team-nestled" required aria-invalid={!!form?.error} />
			</label>
			<label>
				<span>Password</span>
				<input name="password" type="password" autocomplete="current-password" required aria-invalid={!!form?.error} />
			</label>

			{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}

			<Button variant="primary" full type="submit" icon={Lock} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>

			<div class="note">
				<Info size={16} aria-hidden="true" />
				<p>
					Team accounts are <strong>shared</strong>: everything you write is visible to your teammates and mentor. Keep personal notes and
					resumes outside Studio.
				</p>
			</div>
			<p class="muted small">Forgot the password? Ask your Academics Committee contact to reset it.</p>

		</form>
	</main>
</div>

<style lang="scss">
	.page {
		min-height: 100vh;
		display: grid;
		@include up($bp-md) {
			grid-template-columns: 1.1fr 1fr;
		}
	}
	.art {
		background: var(--tpc-gradient);
		padding: var(--sp-5);
		@include down($bp-md) {
			padding: var(--sp-4);
		}
	}
	.art-inner {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--sp-5);
		@include up($bp-md) {
			padding: var(--sp-5);
		}
	}
	.logo {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--fs-lg);
	}
	.pitch {
		margin-top: auto;
		max-width: 30rem;
		@include down($bp-md) {
			display: none;
		}
		h1 {
			font-size: clamp(2rem, 4vw, 3.25rem);
			font-weight: 900;
			line-height: 1.05;
			margin: var(--sp-3) 0;
		}
		p {
			font-size: var(--fs-md);
			max-width: 40ch;
		}
	}
	.pill {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
		font-size: var(--fs-xs);
		font-weight: 700;
	}
	.capy {
		@include down($bp-md) {
			display: none;
		}
	}
	main {
		display: grid;
		place-items: center;
		padding: var(--sp-6) var(--sp-4);
		background: var(--c-surface);
	}
	form {
		width: min(380px, 100%);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}
	h2 {
		font-size: var(--fs-xl);
	}
	.muted {
		color: var(--c-text-muted);
		margin-top: calc(var(--sp-3) * -1);
	}
	.small {
		margin-top: 0;
		font-size: var(--fs-sm);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		span {
			font-weight: 600;
			font-size: var(--fs-sm);
		}
	}
	input {
		height: 42px;
		padding: 0 12px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		background: var(--c-surface);
		&:focus {
			@include focus-ring;
			border-color: transparent;
		}
		&[aria-invalid='true'] {
			border-color: var(--deep-red);
		}
	}
	.error {
		color: var(--deep-red);
		font-size: var(--fs-sm);
	}
	.note {
		display: flex;
		gap: var(--sp-2);
		padding: var(--sp-3);
		border-radius: var(--r-md);
		background: var(--tint-lavender);
		color: var(--deep-lavender);
		font-size: var(--fs-sm);
		:global(svg) {
			flex-shrink: 0;
			margin-top: 3px;
		}
		p {
			color: var(--tpc-ink);
		}
	}
</style>
