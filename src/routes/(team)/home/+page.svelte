<script lang="ts">
	import { ArrowRight, CalendarDays, ExternalLink, FileText, Figma, FolderOpen, Calculator, MessageSquare, Flag } from '@lucide/svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Capybara from '$lib/components/ui/Capybara.svelte';
	import MilestoneStatusBadge from '$lib/components/ui/MilestoneStatusBadge.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import JourneyStrip from '$lib/components/product/JourneyStrip.svelte';
	import TaskList from '$lib/components/product/TaskList.svelte';
	import { phaseMeta } from '$lib/config/phases';
	import * as data from '$lib/data';
	import { fmtDate, relativeDays, timeAgo } from '$lib/utils/format';

	const today = data.today();
	const team = data.getTeam(data.DEMO.teamId)!;
	const semester = data.getSemester();
	const challenge = data.getChallenge(team.challengeId ?? '');
	const roster = data.getRoster(team.id);
	const lesson = data.getUpcomingLesson();
	const milestone = data.getNextMilestone();
	const review = data.getReview(team.id, milestone.id);
	const mentor = data.getMentor(team.mentorIds[0]);
	const feedback = data.getFeedback(team.id)[0];
	const feedbackMilestone = feedback ? data.getMilestones().find((m) => m.id === feedback.milestoneId) : null;
	const product = data.getProduct(team.id);
	const prototypeUrl = product?.fields['ov.prototype']?.value as string | undefined;
	const announcement = data.getAnnouncements()[0];
	const phase = phaseMeta(team.currentPhase);

	const hour = 19; // prototype: fixed so SSR and client agree
	const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
</script>

<svelte:head><title>Home · {team.name} · TPC Studio</title></svelte:head>

<section class="hero">
	<div class="hero-text">
		<span class="eyebrow">{semester.name} · {semester.theme}</span>
		<h1>{greeting}, {team.name}.</h1>
		<p>
			You're in the <strong>{phase.label}</strong> phase{#if challenge}&nbsp;of <a href="/challenges/{challenge.id}">{challenge.title}</a>{/if}. Next up:
			get ready for your {milestone.title}.
		</p>
		<div class="hero-actions">
			<Button variant="primary" href="/product/{team.currentPhase}" iconRight={ArrowRight}>Continue in {phase.label}</Button>
			<Button href="/product/overview">Product overview</Button>
		</div>
	</div>
	<div class="hero-capy"><Capybara size={120} /></div>
</section>

{#if announcement}
	<div class="announce" role="note">
		<Badge tone="pink">Announcement</Badge>
		<strong>{announcement.title}</strong>
		<span>{announcement.body}</span>
	</div>
{/if}

<Card title="Product journey" eyebrow="Informational — work ahead or revisit anytime" id="journey">
	<JourneyStrip current={team.currentPhase} started={team.phasesStarted} linkBase="/product" />
</Card>

<div class="grid">
	<div class="col">
		<Card title={milestone.title} eyebrow="Next milestone · M{milestone.number}" tone="highlight" id="milestone">
			{#snippet action()}
				{#if review}<MilestoneStatusBadge status={review.status} />{/if}
			{/snippet}
			<dl class="meta">
				<div><dt>Target</dt><dd>{fmtDate(milestone.targetDate)} <span class="muted">({relativeDays(today, milestone.targetDate)})</span></dd></div>
				<div><dt>Mentor</dt><dd>{mentor?.displayName ?? 'Unassigned'}</dd></div>
			</dl>
			<p class="label">Your mentor will discuss</p>
			<ul class="chips">
				{#each milestone.reviewAreas as area}<li>{area}</li>{/each}
			</ul>
			<p class="hint">
				<Flag size={14} aria-hidden="true" /> No report needed — your mentor reviews what's already in
				{#each milestone.relatedPhases as p, i}<a href="/product/{p}">{phaseMeta(p).label}</a>{i < milestone.relatedPhases.length - 1 ? ' and ' : ''}{/each}.
			</p>
		</Card>

		<Card title="Team tasks" id="tasks">
			<TaskList tasks={data.getTasks(team.id)} {roster} teamId={team.id} {today} />
		</Card>
	</div>

	<div class="col">
		{#if lesson}
			<Card title="GM{lesson.gmNumber} — {lesson.title}" eyebrow="Upcoming GM" id="gm">
				<p class="date"><CalendarDays size={15} aria-hidden="true" /> {fmtDate(lesson.scheduledDate)} · {relativeDays(today, lesson.scheduledDate)}</p>
				<p class="desc">{lesson.description}</p>
				<a class="link" href="/academy">Open in PM Academy <ArrowRight size={14} aria-hidden="true" /></a>
			</Card>
		{/if}

		<Card title="Recent mentor feedback" id="feedback">
			{#if feedback}
				<blockquote>
					<p>{feedback.body}</p>
					<footer>
						<MessageSquare size={14} aria-hidden="true" />
						{feedback.mentorName} · {timeAgo(feedback.createdAt, today)}
						{#if feedbackMilestone}· <a href="/product/{feedbackMilestone.relatedPhases[0]}">{feedbackMilestone.title}</a>{/if}
					</footer>
				</blockquote>
			{:else}
				<EmptyState title="No feedback yet" body="Your mentor's notes from milestone reviews will show up here." mascot={false} />
			{/if}
		</Card>

		<Card title="Quick links" id="links">
			<ul class="quick">
				<li><a href="/product/overview"><FileText size={16} aria-hidden="true" /> Product documentation</a></li>
				<li>
					{#if prototypeUrl}
						<a href={prototypeUrl} target="_blank" rel="noopener noreferrer"><Figma size={16} aria-hidden="true" /> Figma prototype <ExternalLink size={12} aria-hidden="true" /></a>
					{:else}
						<a href="/product/build"><Figma size={16} aria-hidden="true" /> Add your prototype link</a>
					{/if}
				</li>
				<li><a href="/academy"><FolderOpen size={16} aria-hidden="true" /> Team resources</a></li>
				<li><a href="/product/monetize"><Calculator size={16} aria-hidden="true" /> Business model calculator</a></li>
			</ul>
		</Card>
	</div>
</div>

<style lang="scss">
	.hero {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		padding: var(--sp-5);
		margin-bottom: var(--sp-4);
		border-radius: var(--r-xl);
		overflow: hidden;
		background:
			radial-gradient(120% 140% at 100% 0%, rgba(255, 103, 202, 0.18), transparent 55%),
			radial-gradient(100% 120% at 0% 100%, rgba(132, 179, 255, 0.25), transparent 60%),
			var(--c-surface);
		border: 1px solid var(--c-border);
		@include up($bp-md) {
			padding: var(--sp-6);
		}
	}
	.hero-text {
		flex: 1;
		min-width: 0;
	}
	.eyebrow {
		@include eyebrow;
	}
	h1 {
		font-size: var(--fs-xl);
		margin: 4px 0 var(--sp-2);
		@include up($bp-md) {
			font-size: var(--fs-2xl);
		}
	}
	.hero p {
		color: var(--c-text-muted);
		max-width: 60ch;
		a {
			color: var(--c-text);
			font-weight: 600;
		}
		strong {
			color: var(--c-text);
		}
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		margin-top: var(--sp-4);
	}
	.hero-capy {
		@include down($bp-sm) {
			display: none;
		}
	}
	.announce {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2);
		padding: var(--sp-3) var(--sp-4);
		margin-bottom: var(--sp-4);
		border-radius: var(--r-md);
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		font-size: var(--fs-sm);
		span {
			color: var(--c-text-muted);
		}
	}
	.grid {
		display: grid;
		gap: var(--sp-4);
		margin-top: var(--sp-4);
		@include up($bp-lg) {
			grid-template-columns: 1.35fr 1fr;
		}
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		min-width: 0;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-5);
		margin: 0 0 var(--sp-4);
		dt {
			@include eyebrow;
		}
		dd {
			margin: 2px 0 0;
			font-weight: 600;
		}
	}
	.muted {
		color: var(--c-text-muted);
		font-weight: 400;
	}
	.label {
		font-size: var(--fs-sm);
		font-weight: 600;
		margin-bottom: var(--sp-2);
	}
	.chips {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--sp-4);
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		li {
			padding: 3px 10px;
			border-radius: 999px;
			background: var(--c-surface-2);
			font-size: var(--fs-xs);
			font-weight: 500;
		}
	}
	.hint {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		a {
			color: var(--c-text);
			font-weight: 600;
		}
	}
	.date {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--deep-blue);
	}
	.desc {
		margin: var(--sp-2) 0 var(--sp-3);
		color: var(--c-text-muted);
	}
	.link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		font-size: var(--fs-sm);
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
	blockquote {
		margin: 0;
		padding-left: var(--sp-3);
		border-left: 3px solid var(--tpc-lavender);
		p {
			font-size: var(--fs-sm);
		}
		footer {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			margin-top: var(--sp-2);
			font-size: var(--fs-xs);
			color: var(--c-text-muted);
		}
	}
	.quick {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
		a {
			display: flex;
			align-items: center;
			gap: var(--sp-2);
			padding: 8px;
			border-radius: var(--r-md);
			text-decoration: none;
			font-size: var(--fs-sm);
			font-weight: 500;
			&:hover {
				background: var(--c-surface-2);
			}
		}
	}
</style>
