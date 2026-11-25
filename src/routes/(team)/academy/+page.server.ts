import { loadLessons } from '$lib/server/repo';

export const load = async ({ locals, parent }) => {
	const { ctx } = await parent();
	return { lessons: await loadLessons(locals.supabase, ctx?.semester.id) };
};
