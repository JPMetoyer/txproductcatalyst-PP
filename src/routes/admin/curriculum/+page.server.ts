import { fail } from '@sveltejs/kit';
import { pickSemester, requireAdmin } from '$lib/server/admin';
import { toLesson } from '$lib/server/repo';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals, url }) => {
	const { semesters, current } = await pickSemester(locals.supabase, url);
	if (!current) return { semesters, current, lessons: [] };
	// Admins see unpublished lessons too (RLS: published or is_admin()).
	const { data } = await locals.supabase.from('lessons').select('*').eq('semester_id', current.id).order('gm_number');
	return { semesters, current, lessons: (data ?? []).map(toLesson) };
};

export const actions = {
	publish: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const published = f.get('published') === 'true';
		const { error } = await locals.supabase.from('lessons').update({ published }).eq('id', String(f.get('id')));
		if (error) return fail(500, { error: 'Could not update the GM.' });
		return { ok: published ? 'Published — teams can see it now.' : 'Unpublished.' };
	},
	move: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const a = String(f.get('id'));
		const b = String(f.get('otherId'));
		if (!isUuid(a) || !isUuid(b)) return fail(400, { error: 'Invalid GM' });
		const { error } = await locals.supabase.rpc('admin_swap_lessons', { p_a: a, p_b: b });
		if (error) return fail(500, { error: 'Could not reorder.' });
		return {};
	},
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const { error } = await locals.supabase.from('lessons').delete().eq('id', String((await request.formData()).get('id')));
		if (error) return fail(500, { error: 'Could not delete the GM.' });
		return { ok: 'GM deleted.' };
	}
};
