import { error, json } from '@sveltejs/kit';
import { toDecision } from '$lib/server/repo';
import { assertCanWriteProduct, body, date, dbFail, decisionStatus, int, MAX_SHORT, phase, text, uuid, bad } from '$lib/server/validate';

function fields(b: Record<string, unknown>) {
	const title = text(b.title, 'Title', 200).trim();
	if (!title) bad('Title is required');
	return {
		title,
		decided_on: date(b.date, 'date') ?? new Date().toISOString().slice(0, 10),
		phase: phase(b.phase),
		description: text(b.description, 'Description', 5_000),
		alternatives: text(b.alternatives, 'Alternatives', 5_000),
		evidence: text(b.evidence, 'Evidence', 5_000),
		reasoning: text(b.reasoning, 'Reasoning', 5_000),
		attribution: text(b.attribution, 'Attribution', MAX_SHORT),
		status: decisionStatus(b.status)
	};
}

export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase
		.from('product_decisions')
		.insert({ product_id: uuid(b.productId, 'product'), ...fields(b) })
		.select()
		.single();
	if (e) dbFail(e, 'decision');
	return json({ ok: true, decision: toDecision(data) });
};

export const PATCH = async ({ request, locals }) => {
	const b = await body(request, locals);
	const id = uuid(b.id);
	const expected = int(b.version, 'version');
	const { data, error: e } = await locals.supabase
		.from('product_decisions')
		.update({ ...fields(b), version: expected + 1, updated_at: new Date().toISOString() })
		.eq('id', id)
		.eq('version', expected)
		.select();
	if (e) dbFail(e, 'decision');
	if (data.length) return json({ ok: true, decision: toDecision(data[0]) });
	const { data: current } = await locals.supabase.from('product_decisions').select().eq('id', id).maybeSingle();
	if (!current) error(404, 'This decision was deleted.');
	await assertCanWriteProduct(locals, current.product_id);
	return json({ ok: false, reason: 'conflict', decision: toDecision(current) });
};

export const DELETE = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase.from('product_decisions').delete().eq('id', uuid(b.id)).select('id');
	if (e) dbFail(e, 'decision');
	if (!data.length) error(404, 'Decision not found');
	return json({ ok: true });
};
