import { loadChallenges } from '$lib/server/repo';

// Works signed-out too: RLS only returns challenges when the semester allows public browsing.
export const load = async ({ locals }) => {
	const { data: semester } = await locals.supabase.from('semesters').select('name, theme').eq('status', 'active').maybeSingle();
	return { challenges: await loadChallenges(locals.supabase), semester };
};
