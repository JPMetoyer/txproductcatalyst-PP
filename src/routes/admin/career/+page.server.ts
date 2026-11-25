import { fail } from '@sveltejs/kit';
import { CAREER_SECTIONS, toCareerItem } from '$lib/config/career';
import { isUrl, requireAdmin, str } from '$lib/server/admin';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals }) => {
	const { data } = await locals.supabase.from('resources').select('id, category, title, body, url, position').is('team_id', null).like('category', 'career:%').order('position');
	return { items: (data ?? []).map(toCareerItem) };
};

function fields(f: FormData) {
	const section = String(f.get('section'));
	if (!CAREER_SECTIONS.some((s) => s.key === section)) return { error: 'Pick a section.' };
	const title = str(f.get('title'), 300);
	if (!title) return { error: 'Title is required.' };
	const url = str(f.get('url'), 1000);
	if (url && !isUrl(url)) return { error: 'Links must start with http:// or https://' };
	return { row: { category: `career:${section}`, title, body: str(f.get('body'), 5000), url } };
}

export const actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const r = fields(f);
		if (!r.row) return fail(400, { error: r.error });
		const id = String(f.get('id') ?? '');
		const db = locals.supabase;
		if (isUuid(id)) {
			const { error } = await db.from('resources').update(r.row).eq('id', id);
			if (error) return fail(500, { error: 'Could not save.' });
		} else {
			const { data: last } = await db.from('resources').select('position').eq('category', r.row.category).order('position', { ascending: false }).limit(1).maybeSingle();
			const { error } = await db.from('resources').insert({ ...r.row, position: (last?.position ?? -1) + 1 });
			if (error) return fail(500, { error: 'Could not add.' });
		}
		return { ok: 'Saved.' };
	},
	move: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const ids = [String(f.get('id')), String(f.get('otherId'))];
		if (!ids.every(isUuid)) return fail(400, { error: 'Invalid item' });
		const db = locals.supabase;
		const { data } = await db.from('resources').select('id, position').in('id', ids);
		const [a, b] = ids.map((id) => data?.find((x) => x.id === id));
		if (!a || !b) return fail(404, { error: 'Not found' });
		const [pa, pb] = a.position === b.position ? [b.position + 1, a.position] : [b.position, a.position];
		await db.from('resources').update({ position: pa }).eq('id', a.id);
		await db.from('resources').update({ position: pb }).eq('id', b.id);
		return {};
	},
	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const { error } = await locals.supabase.from('resources').delete().eq('id', String((await request.formData()).get('id'))).like('category', 'career:%');
		if (error) return fail(500, { error: 'Could not delete.' });
		return { ok: 'Deleted.' };
	}
};
