import { error } from '@sveltejs/kit';
import { DEMO, getTeam, teamsForMentor } from '$lib/data';

export const load = ({ params }) => {
	const team = getTeam(params.id);
	// Prototype stand-in for RLS: mentors can only open teams assigned to them.
	if (!team || !teamsForMentor(DEMO.mentorId).some((t) => t.id === team.id)) error(404, 'Team not found');
	return { team };
};
