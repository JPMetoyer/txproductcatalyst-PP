import { DEFAULT_ASSUMPTIONS, sanitize } from '$lib/tools/business-model';

export const load = async ({ locals, parent }) => {
	const { product } = await parent();
	const { data } = await locals.supabase.from('business_model_scenarios').select('assumptions, version, updated_at').eq('product_id', product.id).maybeSingle();
	return {
		assumptions: data ? sanitize(data.assumptions) : structuredClone(DEFAULT_ASSUMPTIONS),
		version: (data?.version as number) ?? 0,
		savedAt: (data?.updated_at as string) ?? null
	};
};
