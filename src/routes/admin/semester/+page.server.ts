import { fail } from '@sveltejs/kit';
import { isDate, listSemesters, requireAdmin, str } from '$lib/server/admin';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals }) => {
	const db = locals.supabase;
	const semesters = await listSemesters(db);
	const counts = await Promise.all(
		semesters.map(async (s) => {
			const [teams, challenges, lessons, milestones] = await Promise.all(
				['teams', 'challenges', 'lessons', 'milestones'].map((t) => db.from(t).select('id', { count: 'exact', head: true }).eq('semester_id', s.id))
			);
			return { id: s.id, teams: teams.count ?? 0, challenges: challenges.count ?? 0, lessons: lessons.count ?? 0, milestones: milestones.count ?? 0 };
		})
	);
	return { semesters, counts };
};

function fields(f: FormData) {
	const name = str(f.get('name'), 80);
	const theme = str(f.get('theme'), 120);
	const start_date = str(f.get('startDate'));
	const end_date = str(f.get('endDate'));
	if (name.length < 2) return { error: 'Semester name is required.' };
	if (!isDate(start_date) || !isDate(end_date)) return { error: 'Enter start and end dates.' };
	if (end_date < start_date) return { error: 'End date must be after the start date.' };
	return { row: { name, theme, start_date, end_date, public_marketplace: f.get('publicMarketplace') === 'on' } };
}

export const actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const r = fields(f);
		if (!r.row) return fail(400, { error: r.error });
		const db = locals.supabase;
		const { data: sem, error } = await db.from('semesters').insert({ ...r.row, status: 'upcoming' }).select('id').single();
		if (error) return fail(500, { error: 'Could not create the semester.' });

		// Optionally copy content from an existing semester so officers don't start from scratch.
		const from = String(f.get('copyFrom') ?? '');
		if (isUuid(from)) {
			const [ch, ls, ms] = await Promise.all([
				db.from('challenges').select('*').eq('semester_id', from),
				db.from('lessons').select('*').eq('semester_id', from),
				db.from('milestones').select('*').eq('semester_id', from)
			]);
			const strip = (rows: any[] | null, extra: Record<string, unknown>) =>
				(rows ?? []).map(({ id, semester_id, ...rest }) => ({ ...rest, ...extra, semester_id: sem.id }));
			const results = await Promise.all([
				ch.data?.length ? db.from('challenges').insert(strip(ch.data, { published: false })) : null,
				ls.data?.length ? db.from('lessons').insert(strip(ls.data, { published: false, scheduled_date: null })) : null,
				ms.data?.length ? db.from('milestones').insert(strip(ms.data, { target_date: null })) : null
			]);
			if (results.some((x) => x?.error)) return { ok: 'Semester created, but some content could not be copied. Check each editor.' };
			return { ok: 'Semester created with copied challenges, curriculum and milestones (unpublished, dates cleared).' };
		}
		return { ok: 'Semester created as upcoming.' };
	},

	update: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = String(f.get('id'));
		const r = fields(f);
		if (!r.row) return fail(400, { error: r.error });
		const { error } = await locals.supabase.from('semesters').update(r.row).eq('id', id);
		if (error) return fail(500, { error: 'Could not save the semester.' });
		return { ok: 'Semester saved.' };
	},

	activate: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('id'));
		const { data: active } = await locals.supabase.from('semesters').select('id, name').eq('status', 'active').maybeSingle();
		if (active && active.id !== id) return fail(400, { error: `Archive ${active.name} first. Only one semester can be active.` });
		const { error } = await locals.supabase.from('semesters').update({ status: 'active' }).eq('id', id);
		if (error) return fail(500, { error: 'Could not activate the semester.' });
		await locals.supabase.from('teams').update({ status: 'active' }).eq('semester_id', id);
		return { ok: 'Semester is now active.' };
	},

	archive: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('id'));
		const db = locals.supabase;
		const { error } = await db.from('semesters').update({ status: 'archived', public_marketplace: false }).eq('id', id);
		if (error) return fail(500, { error: 'Could not archive the semester.' });
		// Teams keep their documentation and can still sign in, but everything becomes read-only.
		await db.from('teams').update({ status: 'archived' }).eq('semester_id', id);
		return { ok: 'Semester archived. Team documentation is preserved and read-only.' };
	}
};
