import { json } from '@sveltejs/kit';
import { body, dbFail, uuid } from '$lib/server/validate';

/** Team flags a milestone as ready for review. Body: { milestoneId }. */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { error } = await locals.supabase.rpc('mark_milestone_ready', { p_milestone: uuid(b.milestoneId, 'milestone') });
	if (error) dbFail(error, 'milestone');
	return json({ ok: true });
};
