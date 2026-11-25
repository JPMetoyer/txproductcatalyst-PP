import { fail } from '@sveltejs/kit';
import { todayISO } from '$lib/server/repo';
import { FLAG_SELECT, loadTeamSummaries, toFlag } from '$lib/server/teams';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals }) => {
	const db = locals.supabase;
	const today = todayISO();
	const { semester, teams, milestones, reviews = [] } = await loadTeamSummaries(db, today);
	const [mentors, flags] = await Promise.all([
		db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor').eq('active', true),
		db.from('team_flags').select(FLAG_SELECT).is('cleared_at', null).order('created_at', { ascending: false })
	]);
	const active = teams.filter((t) => t.status === 'active');
	const name = (id: string) => teams.find((t) => t.id === id)?.name ?? '';
	return {
		today,
		semester,
		teams: active,
		memberCount: active.reduce((n, t) => n + t.rosterCount, 0),
		mentorCount: mentors.count ?? 0,
		milestones,
		reviews,
		flags: (flags.data ?? []).map(toFlag).map((f) => ({ ...f, teamName: name(f.teamId) })),
		// Other signals that a team may need help (no flag required).
		concerns: active
			.filter((t) => t.followUps > 0 || t.blockers.length)
			.map((t) => ({ id: t.id, name: t.name, text: t.blockers[0] ?? `${t.followUps} milestone(s) need follow-up` })),
		activity: reviews
			.filter((r) => r.reviewedAt || r.readyAt)
			.map((r) => ({ ...r, at: (r.reviewedAt ?? r.readyAt)!, teamName: name(r.teamId), msTitle: milestones.find((m) => m.id === r.milestoneId)?.title ?? '' }))
			.sort((a, b) => b.at.localeCompare(a.at))
			.slice(0, 8)
	};
};

export const actions = {
	clearFlag: async ({ request, locals }) => {
		const f = await request.formData();
		const id = String(f.get('id'));
		if (!isUuid(id)) return fail(400, { error: 'Invalid flag' });
		const { error } = await locals.supabase
			.from('team_flags')
			.update({ cleared_at: new Date().toISOString(), cleared_by: locals.profile!.id, clear_note: String(f.get('note') ?? '').slice(0, 1000) })
			.eq('id', id);
		if (error) return fail(500, { error: 'Could not clear the flag.' });
		return { ok: 'Flag cleared.' };
	}
};
