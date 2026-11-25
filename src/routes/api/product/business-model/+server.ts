import { json } from '@sveltejs/kit';
import { sanitize } from '$lib/tools/business-model';
import { body, dbFail, int, uuid } from '$lib/server/validate';

/** Autosave the team's Business Model Studio scenario. Body: { productId, assumptions, expectedVersion } */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error } = await locals.supabase.rpc('save_business_model', {
		p_product: uuid(b.productId, 'product'),
		p_assumptions: sanitize(b.assumptions),
		p_expected_version: int(b.expectedVersion, 'version')
	});
	if (error) dbFail(error, 'business model');
	return json(data);
};
