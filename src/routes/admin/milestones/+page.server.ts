import { fail } from '@sveltejs/kit';
import { JOURNEY } from '$lib/config/phases';
import { lines, optDate, pickSemester, requireAdmin, str } from '$lib/server/admin';
import { toMilestone } from '$lib/server/repo';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals, url }) => {
	const db = locals.supabase;
	const { semesters, current } = await pickSemester(db, url);
	if (!current) return { semesters, current, milestones: [], reviewCounts: {} as Record<string, number> };
	const { data } = await db.from('milestones').select('*, milestone_reviews(status)').eq('semester_id', current.id).order('number');
	const reviewCounts: Record<string, number> = {};
	for (const m of data ?? []) reviewCounts[m.id] = (m.milestone_reviews ?? []).filter((r: { status: string }) => r.status !== 'upcoming').length;
	return { semesters, current, milestones: (data ?? []).map(toMilestone).map((m, i) => ({ ...m, description: (data![i].description as string) ?? '' })), reviewCounts };
};

function row(f: FormData) {
	const number = Number(f.get('number'));
	if (!Number.isInteger(number) || number < 1 || number > 10) return { error: 'Milestone number must be 1–10.' };
	const title = str(f.get('title'), 120);
	if (!title) return { error: 'Title is required.' };
	return {
		row: {
			number,
			title,
			description: str(f.get('description'), 2000),
			after_gm: str(f.get('afterGm'), 60),
			target_date: optDate(f.get('targetDate')),
			review_areas: lines(f.get('reviewAreas'), 20, 200),
			review_questions: lines(f.get('reviewQuestions'), 20, 500),
			related_phases: f.getAll('relatedPhases').map(String).filter((p) => (JOURNEY as string[]).includes(p))
		}
	};
}
const dup = (e: { code?: string }) => (e.code === '23505' ? 'Another milestone already uses that number.' : 'Could not save the milestone.');

export const actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const r = row(f);
		if (!r.row) return fail(400, { error: r.error });
		const id = String(f.get('id') ?? '');
		const db = locals.supabase;
		if (isUuid(id)) {
			const { error } = await db.from('milestones').update(r.row).eq('id', id);
			if (error) return fail(400, { error: dup(error) });
		} else {
			const semesterId = String(f.get('semesterId'));
			if (!isUuid(semesterId)) return fail(400, { error: 'Pick a semester.' });
			const { error } = await db.from('milestones').insert({ ...r.row, semester_id: semesterId });
			if (error) return fail(400, { error: dup(error) });
		}
		return { ok: 'Milestone saved.' };
	},
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('id'));
		const db = locals.supabase;
		const { count } = await db.from('milestone_reviews').select('id', { count: 'exact', head: true }).eq('milestone_id', id).neq('status', 'upcoming');
		if (count) return fail(400, { error: 'Teams already have reviews for this milestone, so it can’t be deleted. Edit it instead.' });
		const { error } = await db.from('milestones').delete().eq('id', id);
		if (error) return fail(500, { error: 'Could not delete the milestone.' });
		return { ok: 'Milestone deleted.' };
	}
};
