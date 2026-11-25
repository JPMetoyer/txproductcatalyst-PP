import { error, fail } from '@sveltejs/kit';
import { parseDemoDay, READINESS } from '$lib/config/demo-day';

export const load = async ({ locals, parent }) => {
	const { ctx } = await parent();
	if (!ctx) error(404, 'No team workspace found.');
	const db = locals.supabase;
	const [sem, prep, links] = await Promise.all([
		db.from('semesters').select('demo_day').eq('id', ctx.semester.id).single(),
		db.from('team_demo_day').select('readiness, checked').eq('team_id', ctx.team.id).maybeSingle(),
		db.from('product_fields').select('field_key, value').eq('product_id', ctx.productId).in('field_key', ['sh.deck', 'sh.prototype', 'ov.prototype', 'bu.prototype'])
	]);
	const link = (k: string) => (links.data?.find((f) => f.field_key === k)?.value as string) || '';
	return {
		settings: parseDemoDay(sem.data?.demo_day),
		readiness: (prep.data?.readiness as string) ?? 'not-started',
		checked: (prep.data?.checked as string[]) ?? [],
		presentationUrl: link('sh.deck'),
		prototypeUrl: link('sh.prototype') || link('bu.prototype') || link('ov.prototype')
	};
};

/** The signed-in team's id (RLS returns exactly one team for a team account). */
async function myTeamId(locals: App.Locals) {
	const { data } = await locals.supabase.from('teams').select('id').maybeSingle();
	if (!data) error(403, 'Team accounts only');
	return data.id as string;
}

async function upsert(locals: App.Locals, patch: Record<string, unknown>) {
	const teamId = await myTeamId(locals);
	const { error: e } = await locals.supabase.from('team_demo_day').upsert({ team_id: teamId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'team_id' });
	return e;
}

export const actions = {
	readiness: async ({ request, locals }) => {
		const value = String((await request.formData()).get('readiness'));
		if (!READINESS.some((r) => r.key === value)) return fail(400, { error: 'Invalid status' });
		const e = await upsert(locals, { readiness: value });
		if (e) return fail(e.code === '42501' ? 403 : 500, { error: 'Could not update readiness.' });
		return { ok: 'Readiness updated — your mentor can see it.' };
	},
	checklist: async ({ request, locals }) => {
		const checked = (await request.formData()).getAll('item').map(String).slice(0, 50).map((s) => s.slice(0, 300));
		const e = await upsert(locals, { checked });
		if (e) return fail(e.code === '42501' ? 403 : 500, { error: 'Could not save the checklist.' });
		return {};
	}
};
