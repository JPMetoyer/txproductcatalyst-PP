import { fail } from '@sveltejs/kit';

export const load = async ({ locals, parent }) => {
	const { ctx } = await parent();
	const { data } = ctx
		? await locals.supabase.from('product_fields').select('value, version').eq('product_id', ctx.productId).eq('field_key', 'ov.name').maybeSingle()
		: { data: null };
	return { productName: (data?.value as string) ?? '', productVersion: (data?.version as number) ?? 0 };
};

export const actions = {
	renameTeam: async ({ request, locals }) => {
		const name = String((await request.formData()).get('name') ?? '').trim();
		if (name.length < 2 || name.length > 80) return fail(400, { error: 'Team name must be 2–80 characters.' });
		const { error } = await locals.supabase.rpc('rename_my_team', { p_name: name });
		if (error) {
			if (error.code === '23505') return fail(400, { error: 'Another team already uses that name this semester.' });
			return fail(error.code === '42501' ? 403 : 500, { error: 'Could not rename the team.' });
		}
		return { ok: 'Team renamed. Your login and documentation are unchanged.' };
	}
};
