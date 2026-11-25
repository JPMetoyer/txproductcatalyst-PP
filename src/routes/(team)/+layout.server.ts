import { loadTeamContext, todayISO } from '$lib/server/repo';

// Shared by every team page. For signed-out visitors (public marketplace) ctx is null.
export const load = async ({ locals }) => {
	const ctx = locals.profile?.role === 'team' ? await loadTeamContext(locals.supabase) : null;
	return { ctx, today: todayISO() };
};
