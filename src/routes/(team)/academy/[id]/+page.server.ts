import { error } from '@sveltejs/kit';
import { loadLesson } from '$lib/server/repo';

export const load = async ({ locals, params }) => {
	const lesson = await loadLesson(locals.supabase, params.id);
	if (!lesson) error(404, 'Lesson not found');
	return { lesson };
};
