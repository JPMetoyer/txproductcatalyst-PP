import { toCareerItem } from '$lib/config/career';

export const load = async ({ locals }) => {
	const { data } = await locals.supabase.from('resources').select('id, category, title, body, url, position').is('team_id', null).like('category', 'career:%').order('position');
	return { items: (data ?? []).map(toCareerItem) };
};
