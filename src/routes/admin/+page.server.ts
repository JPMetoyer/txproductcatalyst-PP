import { fail } from '@sveltejs/kit';
import { todayISO } from '$lib/server/repo';
import { FLAG_SELECT, loadTeamSummaries, toFlag } from '$lib/server/teams';
import { isUuid } from '$lib/server/validate';
import { parseDemoDay } from '$lib/config/demo-day';
import { PRODUCT_SCHEMA } from '$lib/config/product-schema';

const FIELD_LABELS = new Map(PRODUCT_SCHEMA.flatMap((s) => s.groups.flatMap((g) => g.fields.map((f) => [f.key, `${f.label}`] as const))));

export const load = async ({ locals }) => {
	const db = locals.supabase;
	const today = todayISO();
	const { semester, teams, milestones, reviews = [] } = await loadTeamSummaries(db, today);
	const teamIds = teams.map((t) => t.id);
	const [mentors, flags, sem, docs] = await Promise.all([
		db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor').eq('active', true),
		db.from('team_flags').select(FLAG_SELECT).is('cleared_at', null).order('created_at', { ascending: false }),
		semester ? db.from('semesters').select('demo_day').eq('id', semester.id).maybeSingle() : Promise.resolve({ data: null }),
		teamIds.length
			? db.from('product_fields').select('id, field_key, updated_at, product:products!inner(team_id)').in('product.team_id', teamIds).order('updated_at', { ascending: false }).limit(6)
			: Promise.resolve({ data: [] })
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
		demoDay: parseDemoDay(sem.data?.demo_day),
		docUpdates: ((docs.data ?? []) as any[]).map((d) => ({
			id: d.id as string,
			teamName: name(d.product.team_id),
			field: FIELD_LABELS.get(d.field_key) ?? d.field_key,
			at: d.updated_at as string
		})),
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
