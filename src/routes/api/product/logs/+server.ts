import { error, json } from '@sveltejs/kit';
import { toLog } from '$lib/server/repo';
import { body, dbFail, int, logData, logKind, uuid } from '$lib/server/validate';

/** Add an entry. Body: { productId, kind, position }. */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase
		.from('log_entries')
		.insert({ product_id: uuid(b.productId, 'product'), kind: logKind(b.kind), position: int(b.position ?? 0, 'position') })
		.select()
		.single();
	if (e) dbFail(e, 'entry');
	return json(toLog(data));
};

/** Update an entry's data if nobody else changed it. Body: { id, kind, data, expectedVersion }. */
export const PATCH = async ({ request, locals }) => {
	const b = await body(request, locals);
	const id = uuid(b.id);
	const expected = int(b.expectedVersion, 'version');
	const { data, error: e } = await locals.supabase
		.from('log_entries')
		.update({ data: logData(logKind(b.kind), b.data), version: expected + 1, updated_at: new Date().toISOString() })
		.eq('id', id)
		.eq('version', expected)
		.select();
	if (e) dbFail(e, 'entry');
	if (data.length) return json({ ok: true, entry: toLog(data[0]) });
	// Nothing updated: either a teammate saved a newer version, or the row is gone / not ours.
	const { data: current } = await locals.supabase.from('log_entries').select().eq('id', id).maybeSingle();
	if (!current) error(404, 'This entry was deleted.');
	return json({ ok: false, reason: 'conflict', entry: toLog(current) });
};

/** Body: { id }. */
export const DELETE = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase.from('log_entries').delete().eq('id', uuid(b.id)).select('id');
	if (e) dbFail(e, 'entry');
	if (!data.length) error(404, 'Entry not found');
	return json({ ok: true });
};
