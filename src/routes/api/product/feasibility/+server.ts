import { error, json } from '@sveltejs/kit';
import { AREAS, STATUSES } from '$lib/tools/feasibility';
import { assertCanWriteProduct, bad, body, dbFail, int, text, uuid } from '$lib/server/validate';

/** Save one area. Body: { productId, area, status, notes, evidence, expectedVersion } */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const productId = uuid(b.productId, 'product');
	const area = AREAS.find((a) => a.key === b.area)?.key ?? bad('Unknown area');
	const status = STATUSES.find((s) => s.key === b.status)?.key ?? bad('Invalid status');
	const expected = int(b.expectedVersion, 'version');
	const fields = { status, notes: text(b.notes, 'Notes', 5000), evidence: text(b.evidence, 'Evidence', 5000), updated_at: new Date().toISOString() };
	const db = locals.supabase;
	await assertCanWriteProduct(locals, productId);

	let r;
	if (expected === 0) {
		r = await db.from('feasibility_assessments').insert({ product_id: productId, area, ...fields, version: 1 }).select().maybeSingle();
		if (r.error?.code === '23505') r = { data: null, error: null }; // someone created it first → conflict below
	} else {
		r = await db.from('feasibility_assessments').update({ ...fields, version: expected + 1 }).eq('product_id', productId).eq('area', area).eq('version', expected).select().maybeSingle();
	}
	if (r.error) dbFail(r.error, 'assessment');
	if (r.data) return json({ ok: true, version: r.data.version });

	const { data: cur } = await db.from('feasibility_assessments').select('status, notes, evidence, version').eq('product_id', productId).eq('area', area).maybeSingle();
	if (!cur) error(403, "You don't have permission to change this assessment.");
	return json({ ok: false, reason: 'conflict', current: cur });
};
