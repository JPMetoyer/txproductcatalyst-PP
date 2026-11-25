import { json } from '@sveltejs/kit';
import { body, dbFail, evidence, fieldValue, int, uuid } from '$lib/server/validate';

/** Autosave one documentation field. Body: { productId, key, value, evidence, expectedVersion }. */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { key, value } = fieldValue(b.key, b.value);
	const { data, error } = await locals.supabase.rpc('save_field', {
		p_product: uuid(b.productId, 'product'),
		p_key: key,
		p_value: value,
		p_evidence: evidence(b.evidence),
		p_expected_version: int(b.expectedVersion, 'version')
	});
	if (error) dbFail(error, 'field');
	const f = data.field;
	return json({ ok: data.ok, reason: data.reason, field: { value: f.value, evidence: f.evidence, version: f.version, updatedAt: f.updated_at } });
};
