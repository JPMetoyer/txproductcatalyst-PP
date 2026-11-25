import { loadTeamSummaries } from '$lib/server/teams';
import { todayISO } from '$lib/server/repo';

export const load = async ({ locals }) => ({ teams: (await loadTeamSummaries(locals.supabase, todayISO())).teams });
