import { error, fail, redirect } from '@sveltejs/kit';
import { lines, pickSemester, requireAdmin, str } from '$lib/server/admin';
import { toChallenge } from '$lib/server/repo';
import { isUuid } from '$lib/server/validate';

const ICONS = ['home', 'wallet', 'briefcase', 'map', 'heart-handshake', 'rocket', 'users', 'clipboard-list'];
const ACCENTS = ['blue', 'pink', 'orange', 'lavender'];

export const load = async ({ locals, params, url }) => {
	const { current } = await pickSemester(locals.supabase, url);
	if (params.id === 'new') return { challenge: null, semester: current, icons: ICONS, accents: ACCENTS };
	if (!isUuid(params.id)) error(404, 'Challenge not found');
	const { data } = await locals.supabase.from('challenges').select('*, semester:semesters(id, name)').eq('id', params.id).maybeSingle();
	if (!data) error(404, 'Challenge not found');
	return { challenge: toChallenge(data), semester: data.semester as { id: string; name: string }, icons: ICONS, accents: ACCENTS };
};

export const actions = {
	save: async ({ request, locals, params, url }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const row = {
			code: str(f.get('code'), 20),
			title: str(f.get('title'), 120),
			summary: str(f.get('summary'), 300),
			icon: ICONS.includes(String(f.get('icon'))) ? String(f.get('icon')) : 'home',
			accent: ACCENTS.includes(String(f.get('accent'))) ? String(f.get('accent')) : 'blue',
			experience: str(f.get('experience')),
			mission: str(f.get('mission')),
			stakeholders: lines(f.get('stakeholders'), 20, 120),
			research_considerations: lines(f.get('research')),
			boundaries: lines(f.get('boundaries')),
			expectations: lines(f.get('expectations')),
			published: f.get('published') === 'on'
		};
		if (!row.code || !row.title) return fail(400, { error: 'Code and title are required.' });

		const db = locals.supabase;
		let id = params.id;
		if (id === 'new') {
			const semesterId = String(f.get('semesterId'));
			if (!isUuid(semesterId)) return fail(400, { error: 'Pick a semester.' });
			const { data: last } = await db.from('challenges').select('position').eq('semester_id', semesterId).order('position', { ascending: false }).limit(1).maybeSingle();
			const { data, error: e } = await db.from('challenges').insert({ ...row, semester_id: semesterId, position: (last?.position ?? -1) + 1 }).select('id').single();
			if (e) return fail(400, { error: e.code === '23505' ? `Code ${row.code} is already used this semester.` : 'Could not create the challenge.' });
			id = data.id;
		} else {
			const { error: e } = await db.from('challenges').update(row).eq('id', id);
			if (e) return fail(400, { error: e.code === '23505' ? `Code ${row.code} is already used this semester.` : 'Could not save the challenge.' });
		}
		redirect(303, `/admin/challenges${url.searchParams.get('semester') ? `?semester=${url.searchParams.get('semester')}` : ''}`);
	}
};
