import { error, fail } from '@sveltejs/kit';
import { JOURNEY, recommendedPhase } from '$lib/config/phases';
import { loadLessons, loadMilestones, loadProduct, loadReviews, todayISO } from '$lib/server/repo';
import { FLAG_SELECT, toFlag } from '$lib/server/teams';
import { isUuid } from '$lib/server/validate';
import type { JourneyPhase, MilestoneStatus } from '$lib/types/domain';

export const load = async ({ locals, params }) => {
	const db = locals.supabase;
	if (!isUuid(params.id)) error(404, 'Team not found');
	// RLS: a mentor only gets a row back for teams assigned to them.
	const { data: t } = await db
		.from('teams')
		.select('id, name, semester_id, current_phase, status, challenge:challenges(id, title), team_members(id, name, active), products(id)')
		.eq('id', params.id)
		.maybeSingle();
	if (!t) error(404, 'Team not found');
	const team = t as any;
	const productId = (Array.isArray(team.products) ? team.products[0] : team.products)?.id as string | undefined;

	const today = todayISO();
	const [doc, milestones, reviews, lessons, flags] = await Promise.all([
		productId ? loadProduct(db, productId, team.id) : null,
		loadMilestones(db, team.semester_id),
		loadReviews(db, team.id),
		loadLessons(db, team.semester_id),
		db.from('team_flags').select(FLAG_SELECT).eq('team_id', team.id).order('created_at', { ascending: false })
	]);

	return {
		today,
		team: {
			id: team.id as string,
			name: team.name as string,
			currentPhase: team.current_phase as JourneyPhase,
			recommendedPhase: recommendedPhase(lessons, today),
			challengeTitle: (team.challenge?.title as string) ?? null,
			roster: (team.team_members as any[]).filter((m) => m.active).map((m) => ({ id: m.id as string, name: m.name as string }))
		},
		product: doc?.product ?? null,
		comments: doc?.comments ?? [],
		milestones,
		reviews,
		flags: (flags.data ?? []).map(toFlag)
	};
};

const teamId = (params: { id: string }) => (isUuid(params.id) ? params.id : error(404, 'Team not found'));

export const actions = {
	review: async ({ request, locals, params }) => {
		const f = await request.formData();
		const milestoneId = String(f.get('milestoneId'));
		const status = String(f.get('status')) as MilestoneStatus;
		if (!isUuid(milestoneId)) return fail(400, { error: 'Choose a milestone' });
		if (!['reviewed', 'follow-up'].includes(status)) return fail(400, { error: 'Choose an outcome' });
		const reviewedOn = String(f.get('reviewedOn') || todayISO());
		if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)) return fail(400, { error: 'Invalid review date' });
		const clip = (k: string, max = 5000) => String(f.get(k) ?? '').slice(0, max);
		const { error: e } = await locals.supabase.from('milestone_reviews').upsert(
			{
				milestone_id: milestoneId,
				team_id: teamId(params),
				reviewer_profile_id: locals.profile!.id,
				status,
				feedback: clip('feedback'),
				next_steps: clip('nextSteps'),
				blockers: clip('blockers', 2000),
				reviewed_at: `${reviewedOn}T12:00:00Z`,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'milestone_id,team_id' }
		);
		if (e) return fail(e.code === '42501' ? 403 : 500, { error: 'Could not save the review.' });
		return { ok: 'Review saved. The team sees your feedback on their Home page.' };
	},

	flag: async ({ request, locals, params }) => {
		const reason = String((await request.formData()).get('reason') ?? '').trim();
		if (reason.length < 3) return fail(400, { error: 'Add a short note explaining why the team needs support.' });
		const { error: e } = await locals.supabase
			.from('team_flags')
			.insert({ team_id: teamId(params), reason: reason.slice(0, 1000), flagged_by: locals.profile!.id });
		if (e) return fail(e.code === '42501' ? 403 : 500, { error: 'Could not flag the team.' });
		return { ok: 'Flagged for the Academics Committee.' };
	},

	phase: async ({ request, locals, params }) => {
		const phase = String((await request.formData()).get('phase')) as JourneyPhase;
		if (!JOURNEY.includes(phase)) return fail(400, { error: 'Invalid phase' });
		const { error: e } = await locals.supabase.rpc('set_team_phase', { p_team: teamId(params), p_phase: phase });
		if (e) return fail(e.code === '42501' ? 403 : 500, { error: 'Could not update the phase.' });
		return { ok: 'Phase updated.' };
	}
};
