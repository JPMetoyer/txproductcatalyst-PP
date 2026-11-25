// Server-side data access for team pages. Every query runs as the signed-in user
// (locals.supabase), so row-level security decides what comes back.
// Rows are mapped to the domain types in $lib/types/domain so components don't see snake_case.

import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	Announcement,
	Challenge,
	Decision,
	FieldComment,
	JourneyPhase,
	Lesson,
	LogEntry,
	Milestone,
	MilestoneReview,
	Product,
	ProductFields,
	Task,
	TeamMember
} from '$lib/types/domain';

/** Today's date in Austin, as 'YYYY-MM-DD'. */
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());

/** Throws a 500 on query errors. (For maybeSingle() queries the result may still be null at runtime.) */
const check = <T>(r: { data: T; error: { message: string } | null }, what: string): NonNullable<T> => {
	if (r.error) error(500, `Could not load ${what}`);
	return r.data as NonNullable<T>;
};

/* ---------------- mappers ---------------- */

export const toChallenge = (c: any): Challenge => ({
	id: c.id,
	semesterId: c.semester_id,
	code: c.code,
	title: c.title,
	summary: c.summary,
	icon: c.icon,
	accent: c.accent,
	experience: c.experience,
	mission: c.mission,
	stakeholders: c.stakeholders,
	researchConsiderations: c.research_considerations,
	boundaries: c.boundaries,
	expectations: c.expectations,
	published: c.published
});

export const toLesson = (l: any): Lesson => ({
	id: l.id,
	gmNumber: l.gm_number,
	title: l.title,
	scheduledDate: l.scheduled_date,
	description: l.description,
	topics: l.content?.topics ?? [],
	relatedPhase: l.related_phase,
	published: l.published
});

export const toMilestone = (m: any): Milestone => ({
	id: m.id,
	number: m.number,
	title: m.title,
	afterGm: m.after_gm,
	targetDate: m.target_date,
	reviewAreas: m.review_areas,
	reviewQuestions: m.review_questions,
	relatedPhases: m.related_phases
});

export const toReview = (r: any): MilestoneReview => ({
	id: r.id,
	milestoneId: r.milestone_id,
	teamId: r.team_id,
	reviewerId: r.reviewer_profile_id,
	status: r.status,
	feedback: r.feedback,
	nextSteps: r.next_steps,
	blockers: r.blockers,
	reviewedAt: r.reviewed_at,
	readyAt: r.ready_at
});

export const toLog = (l: any): LogEntry => ({
	id: l.id,
	productId: l.product_id,
	kind: l.kind,
	data: l.data,
	position: l.position,
	version: l.version
});

export const toDecision = (d: any): Decision => ({
	id: d.id,
	productId: d.product_id,
	title: d.title,
	date: d.decided_on,
	phase: d.phase,
	description: d.description,
	alternatives: d.alternatives,
	evidence: d.evidence,
	reasoning: d.reasoning,
	attribution: d.attribution,
	status: d.status,
	version: d.version
});

export const toTask = (t: any): Task => ({
	id: t.id,
	teamId: t.team_id,
	title: t.title,
	assignedMemberId: t.assigned_member_id,
	dueDate: t.due_date,
	status: t.status
});

/* ---------------- loaders ---------------- */

export interface TeamContext {
	team: { id: string; name: string; currentPhase: JourneyPhase; challengeId: string | null };
	semester: { id: string; name: string; theme: string; status: 'active' | 'archived' };
	challenge: Pick<Challenge, 'id' | 'title'> | null;
	roster: TeamMember[];
	mentors: { id: string; name: string }[];
	productId: string;
}

/** The signed-in team's own context. RLS returns exactly one team for a team account. */
export async function loadTeamContext(db: SupabaseClient): Promise<TeamContext | null> {
	const t = check(
		await db
			.from('teams')
			.select(
				'id, name, current_phase, challenge_id, semester:semesters(id, name, theme, status), challenge:challenges(id, title), team_members(id, name, active), team_mentors(profile:profiles(id, display_name)), products(id)'
			)
			.maybeSingle(),
		'team'
	) as any;
	if (!t) return null;
	return {
		team: { id: t.id, name: t.name, currentPhase: t.current_phase, challengeId: t.challenge_id },
		semester: t.semester,
		challenge: t.challenge,
		roster: (t.team_members ?? [])
			.filter((m: any) => m.active)
			.map((m: any) => ({ id: m.id, teamId: t.id, name: m.name, active: true }))
			.sort((a: TeamMember, b: TeamMember) => a.name.localeCompare(b.name)),
		mentors: (t.team_mentors ?? []).filter((x: any) => x.profile).map((x: any) => ({ id: x.profile.id, name: x.profile.display_name })),
		productId: (Array.isArray(t.products) ? t.products[0] : t.products)?.id
	};
}

export async function loadChallenges(db: SupabaseClient) {
	return check(await db.from('challenges').select('*').eq('published', true).order('position'), 'challenges').map(toChallenge);
}

export async function loadChallenge(db: SupabaseClient, id: string) {
	if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
	const c = check(await db.from('challenges').select('*').eq('id', id).eq('published', true).maybeSingle(), 'challenge') as unknown;
	return c ? toChallenge(c) : null;
}

export async function loadLessons(db: SupabaseClient, semesterId?: string) {
	let q = db.from('lessons').select('*').eq('published', true).order('gm_number');
	if (semesterId) q = q.eq('semester_id', semesterId);
	return check(await q, 'lessons').map(toLesson);
}

export async function loadMilestones(db: SupabaseClient, semesterId: string) {
	return check(await db.from('milestones').select('*').eq('semester_id', semesterId).order('number'), 'milestones').map(toMilestone);
}

export async function loadReviews(db: SupabaseClient, teamId: string) {
	return check(await db.from('milestone_reviews').select('*').eq('team_id', teamId), 'reviews').map(toReview);
}

export async function loadTasks(db: SupabaseClient, teamId: string) {
	return check(await db.from('tasks').select('*').eq('team_id', teamId).order('created_at'), 'tasks').map(toTask);
}

export async function loadAnnouncements(db: SupabaseClient, semesterId: string): Promise<Announcement[]> {
	return check(
		await db.from('announcements').select('*').eq('semester_id', semesterId).order('published_at', { ascending: false }).limit(3),
		'announcements'
	).map((a: any) => ({ id: a.id, title: a.title, body: a.body, publishedAt: a.published_at }));
}

/** Latest written mentor feedback for the team, with the reviewer's name. */
export async function loadLatestFeedback(db: SupabaseClient, teamId: string) {
	const r = check(
		await db
			.from('milestone_reviews')
			.select('milestone_id, feedback, updated_at, reviewed_at, reviewer:profiles(display_name), milestone:milestones(title, related_phases)')
			.eq('team_id', teamId)
			.neq('feedback', '')
			.order('updated_at', { ascending: false })
			.limit(1)
			.maybeSingle(),
		'feedback'
	) as any;
	if (!r) return null;
	return {
		body: r.feedback as string,
		at: (r.reviewed_at ?? r.updated_at) as string,
		mentorName: (r.reviewer?.display_name as string) ?? 'Your mentor',
		milestoneTitle: r.milestone?.title as string,
		phase: (r.milestone?.related_phases?.[0] ?? 'overview') as string
	};
}

/** Full product documentation for the workspace. */
export async function loadProduct(db: SupabaseClient, productId: string, teamId: string): Promise<{ product: Product; comments: FieldComment[] }> {
	const [fields, logs, decisions, comments] = await Promise.all([
		db.from('product_fields').select('field_key, value, evidence, version, updated_at').eq('product_id', productId),
		db.from('log_entries').select('*').eq('product_id', productId).order('position').order('created_at'),
		db.from('product_decisions').select('*').eq('product_id', productId).order('decided_on', { ascending: false }),
		db
			.from('field_comments')
			.select('id, product_id, field_key, body, resolved, created_at, author:profiles(display_name)')
			.eq('product_id', productId)
			.eq('resolved', false)
			.order('created_at')
	]);
	const f: ProductFields = {};
	for (const row of check(fields, 'fields') as any[]) {
		f[row.field_key] = { value: row.value, evidence: row.evidence, version: row.version, updatedAt: row.updated_at };
	}
	return {
		product: {
			id: productId,
			teamId,
			name: (f['ov.name']?.value as string) ?? '',
			fields: f,
			logs: check(logs, 'logs').map(toLog),
			decisions: check(decisions, 'decisions').map(toDecision)
		},
		comments: (check(comments, 'comments') as any[]).map((c) => ({
			id: c.id,
			productId: c.product_id,
			fieldKey: c.field_key,
			authorName: c.author?.display_name ?? 'Academics Committee',
			body: c.body,
			createdAt: c.created_at,
			resolved: c.resolved
		}))
	};
}
