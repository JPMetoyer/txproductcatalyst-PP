import { fail } from '@sveltejs/kit';
import { pickSemester, requireAdmin } from '$lib/server/admin';
import { toChallenge } from '$lib/server/repo';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals, url }) => {
	const db = locals.supabase;
	const { semesters, current } = await pickSemester(db, url);
	if (!current) return { semesters, current, challenges: [], assigned: {} as Record<string, number> };
	const [ch, teams] = await Promise.all([
		db.from('challenges').select('*').eq('semester_id', current.id).order('position').order('code'),
		db.from('teams').select('challenge_id').eq('semester_id', current.id)
	]);
	const assigned: Record<string, number> = {};
	for (const t of teams.data ?? []) if (t.challenge_id) assigned[t.challenge_id] = (assigned[t.challenge_id] ?? 0) + 1;
	return { semesters, current, challenges: (ch.data ?? []).map(toChallenge), assigned, positions: Object.fromEntries((ch.data ?? []).map((c) => [c.id, c.position])) };
};

export const actions = {
	publish: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const { error } = await locals.supabase.from('challenges').update({ published: f.get('published') === 'true' }).eq('id', String(f.get('id')));
		if (error) return fail(500, { error: 'Could not update the challenge.' });
		return { ok: f.get('published') === 'true' ? 'Published.' : 'Unpublished.' };
	},

	/** Swap display order with the neighbour above/below. */
	move: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const a = String(f.get('id'));
		const b = String(f.get('otherId'));
		if (!isUuid(a) || !isUuid(b)) return fail(400, { error: 'Invalid challenge' });
		const db = locals.supabase;
		const { data } = await db.from('challenges').select('id, position').in('id', [a, b]);
		const pa = data?.find((x) => x.id === a)?.position;
		const pb = data?.find((x) => x.id === b)?.position;
		if (pa == null || pb == null) return fail(404, { error: 'Challenge not found' });
		// Positions may collide after imports; fall back to distinct values.
		const [na, nb] = pa === pb ? [pb + 1, pa] : [pb, pa];
		await db.from('challenges').update({ position: na }).eq('id', a);
		await db.from('challenges').update({ position: nb }).eq('id', b);
		return {};
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('id'));
		const db = locals.supabase;
		const { count } = await db.from('teams').select('id', { count: 'exact', head: true }).eq('challenge_id', id);
		if (count) return fail(400, { error: 'Teams are assigned to this challenge. Unpublish it instead, or reassign the teams first.' });
		const { error } = await db.from('challenges').delete().eq('id', id);
		if (error) return fail(500, { error: 'Could not delete the challenge.' });
		return { ok: 'Challenge deleted.' };
	}
};
