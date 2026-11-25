import { loadLessons, todayISO } from '$lib/server/repo';
import { activeSemester } from '$lib/server/teams';

export const load = async ({ locals }) => {
	const sem = await activeSemester(locals.supabase);
	return { lessons: await loadLessons(locals.supabase, sem?.id), today: todayISO() };
};
