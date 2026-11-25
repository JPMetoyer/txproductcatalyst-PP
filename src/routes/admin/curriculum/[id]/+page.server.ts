import { error, fail, redirect } from '@sveltejs/kit';
import { PHASES } from '$lib/config/phases';
import { isUrl, lines, optDate, pickSemester, requireAdmin, str } from '$lib/server/admin';
import { toLesson } from '$lib/server/repo';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals, params, url }) => {
	const { current } = await pickSemester(locals.supabase, url);
	if (params.id === 'new') {
		const { data: last } = current
			? await locals.supabase.from('lessons').select('gm_number').eq('semester_id', current.id).order('gm_number', { ascending: false }).limit(1).maybeSingle()
			: { data: null };
		return { lesson: null, semester: current, nextGm: (last?.gm_number ?? 0) + 1 };
	}
	if (!isUuid(params.id)) error(404, 'GM not found');
	const { data } = await locals.supabase.from('lessons').select('*, semester:semesters(id, name)').eq('id', params.id).maybeSingle();
	if (!data) error(404, 'GM not found');
	return { lesson: toLesson(data), semester: data.semester as { id: string; name: string }, nextGm: data.gm_number };
};

/** "Title | https://…" per line. */
function resources(v: FormDataEntryValue | null) {
	return lines(v, 30, 600)
		.map((l) => {
			const [title, url] = l.includes('|') ? l.split('|').map((x) => x.trim()) : [l, l];
			return { title: title.slice(0, 200), url };
		})
		.filter((r) => isUrl(r.url));
}

export const actions = {
	save: async ({ request, locals, params, url }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const gm = Number(f.get('gmNumber'));
		const phase = String(f.get('relatedPhase') ?? '');
		const slideUrl = str(f.get('slideUrl'), 1000);
		if (!Number.isInteger(gm) || gm < 1 || gm > 20) return fail(400, { error: 'GM number must be 1–20.' });
		if (slideUrl && !isUrl(slideUrl)) return fail(400, { error: 'Slide link must start with http:// or https://' });
		const row = {
			gm_number: gm,
			title: str(f.get('title'), 120),
			scheduled_date: optDate(f.get('date')),
			description: str(f.get('description'), 2000),
			related_phase: PHASES.some((p) => p.key === phase) ? phase : null,
			published: f.get('published') === 'on',
			content: {
				topics: lines(f.get('topics'), 20, 120),
				objectives: lines(f.get('objectives')),
				slideUrl,
				keyConcepts: lines(f.get('keyConcepts')),
				examples: str(f.get('examples')),
				activity: str(f.get('activity')),
				resources: resources(f.get('resources'))
			}
		};
		if (!row.title) return fail(400, { error: 'Title is required.' });

		const db = locals.supabase;
		const dup = (e: { code?: string } | null) => (e?.code === '23505' ? `GM${gm} already exists this semester. Pick another number or reorder from the list.` : 'Could not save the GM.');
		if (params.id === 'new') {
			const semesterId = String(f.get('semesterId'));
			if (!isUuid(semesterId)) return fail(400, { error: 'Pick a semester.' });
			const { error: e } = await db.from('lessons').insert({ ...row, semester_id: semesterId, position: gm });
			if (e) return fail(400, { error: dup(e) });
		} else {
			const { error: e } = await db.from('lessons').update(row).eq('id', params.id);
			if (e) return fail(400, { error: dup(e) });
		}
		redirect(303, `/admin/curriculum${url.searchParams.get('semester') ? `?semester=${url.searchParams.get('semester')}` : ''}`);
	}
};
