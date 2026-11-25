import { error } from '@sveltejs/kit';
import { loadChallenge } from '$lib/server/repo';

export const load = async ({ locals, params }) => {
	const challenge = await loadChallenge(locals.supabase, params.id);
	if (!challenge) error(404, 'Challenge not found');
	return { challenge };
};
