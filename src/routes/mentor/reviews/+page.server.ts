import { loadTeamSummaries } from '$lib/server/teams';
import { todayISO } from '$lib/server/repo';

export const load = async ({ locals }) => {
	const { teams, milestones, reviews = [] } = await loadTeamSummaries(locals.supabase, todayISO());
	return { teams: teams.map((t) => ({ id: t.id, name: t.name })), milestones, reviews };
};
