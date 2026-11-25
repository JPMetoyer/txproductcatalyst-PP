export const load = async ({ locals }) => {
	const { data: semester } = await locals.supabase.from('semesters').select('name, status').eq('status', 'active').maybeSingle();
	return { semesterName: semester?.name ?? 'No active semester' };
};
