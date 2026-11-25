export const load = async ({ locals }) => {
	const { data: semester } = await locals.supabase.from('semesters').select('name').eq('status', 'active').maybeSingle();
	return { displayName: locals.profile!.displayName, semesterName: semester?.name ?? '' };
};
