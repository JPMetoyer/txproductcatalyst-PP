// Loads the signed-in team's workspace header. RLS guarantees a team account only ever sees its own team.
export const load = async ({ locals }) => {
	if (!locals.profile) return { team: null, semester: null }; // public marketplace browsing

	const { data: team } = await locals.supabase
		.from('teams')
		.select('id, name, current_phase, semester:semesters(name, theme)')
		.maybeSingle();

	const semester = team?.semester as unknown as { name: string; theme: string } | null;
	return { team: team ? { id: team.id, name: team.name } : null, semester };
};
