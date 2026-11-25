import { AREAS, type Assessment } from '$lib/tools/feasibility';

export const load = async ({ locals, parent }) => {
	const { product } = await parent();
	const { data } = await locals.supabase.from('feasibility_assessments').select('area, status, notes, evidence, version').eq('product_id', product.id);
	const saved = new Map((data ?? []).map((r) => [r.area, r]));
	return {
		assessments: AREAS.map(
			(a): Assessment => (saved.get(a.key) as Assessment | undefined) ?? { area: a.key, status: 'not-investigated', notes: '', evidence: '', version: 0 }
		)
	};
};
