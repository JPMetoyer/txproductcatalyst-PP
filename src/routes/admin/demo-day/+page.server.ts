import { fail } from '@sveltejs/kit';
import { parseDemoDay } from '$lib/config/demo-day';
import { isUrl, lines, optDate, pickSemester, requireAdmin, str } from '$lib/server/admin';

export const load = async ({ locals, url }) => {
	const db = locals.supabase;
	const { semesters, current } = await pickSemester(db, url);
	if (!current) return { semesters, current, settings: parseDemoDay({}), teams: [] };
	const [sem, teams] = await Promise.all([
		db.from('semesters').select('demo_day').eq('id', current.id).single(),
		db.from('teams').select('id, name, team_demo_day(readiness, checked)').eq('semester_id', current.id).order('name')
	]);
	return {
		semesters,
		current,
		settings: parseDemoDay(sem.data?.demo_day),
		teams: (teams.data ?? []).map((t: any) => {
			const p = Array.isArray(t.team_demo_day) ? t.team_demo_day[0] : t.team_demo_day;
			return { id: t.id as string, name: t.name as string, readiness: (p?.readiness as string) ?? 'not-started', checkedCount: (p?.checked?.length as number) ?? 0 };
		})
	};
};

export const actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const labels = f.getAll('rubricLabel').map(String);
		const points = f.getAll('rubricPoints').map(Number);
		const descs = f.getAll('rubricDesc').map(String);
		const rubric = labels
			.map((label, i) => ({ label: label.trim().slice(0, 120), points: Math.max(0, Math.min(1000, Math.round(points[i] || 0))), description: (descs[i] ?? '').trim().slice(0, 500) }))
			.filter((r) => r.label);
		if (!rubric.length) return fail(400, { error: 'Add at least one rubric category.' });
		const resources = lines(f.get('resources'), 30, 600)
			.map((l) => {
				const [title, url] = l.includes('|') ? l.split('|').map((x) => x.trim()) : [l, l];
				return { title: title.slice(0, 200), url };
			})
			.filter((r) => isUrl(r.url));
		const settings = {
			date: optDate(f.get('date')),
			time: str(f.get('time'), 60),
			location: str(f.get('location'), 200),
			instructions: str(f.get('instructions'), 4000),
			rubric,
			checklist: lines(f.get('checklist'), 30, 300),
			judgeQuestions: lines(f.get('judgeQuestions'), 30, 500),
			resources
		};
		const { error } = await locals.supabase.from('semesters').update({ demo_day: settings }).eq('id', String(f.get('semesterId')));
		if (error) return fail(500, { error: 'Could not save Demo Day settings.' });
		return { ok: 'Demo Day settings saved.' };
	}
};
