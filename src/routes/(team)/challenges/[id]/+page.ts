import { error } from '@sveltejs/kit';
import { getChallenge } from '$lib/data';

export const load = ({ params }) => {
	const challenge = getChallenge(params.id);
	if (!challenge || !challenge.published) error(404, 'Challenge not found');
	return { challenge };
};
