import { error, json } from '@sveltejs/kit';
import { COMMENT_SELECT, toComment } from '$lib/server/repo';
import { bad, body, dbFail, isUuid, text, uuid } from '$lib/server/validate';
import { PRODUCT_SCHEMA } from '$lib/config/product-schema';

const FIELD_KEYS = new Set(PRODUCT_SCHEMA.flatMap((s) => s.groups.flatMap((g) => g.fields.map((f) => f.key))));

/** Start a thread (mentors/admins) or reply (anyone on the thread's team). Body: { productId, fieldKey, body, parentId? } */
export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const fieldKey = typeof b.fieldKey === 'string' && FIELD_KEYS.has(b.fieldKey) ? b.fieldKey : bad('Unknown field');
	const msg = text(b.body, 'Comment', 4_000).trim() || bad('Write a comment first');
	const parentId = b.parentId == null ? null : isUuid(b.parentId) ? b.parentId : bad('Invalid thread');
	const { data, error: e } = await locals.supabase
		.from('field_comments')
		.insert({ product_id: uuid(b.productId, 'product'), field_key: fieldKey, body: msg, parent_id: parentId, author_profile_id: locals.profile!.id })
		.select(COMMENT_SELECT)
		.single();
	if (e) dbFail(e, 'comment');
	return json(toComment(data));
};

/** Resolve or reopen a thread. Body: { id, resolved } */
export const PATCH = async ({ request, locals }) => {
	const b = await body(request, locals);
	if (typeof b.resolved !== 'boolean') bad('Invalid request');
	const id = uuid(b.id);
	const { error: e } = await locals.supabase.rpc('set_comment_resolved', { p_comment: id, p_resolved: b.resolved });
	if (e) dbFail(e, 'comment');
	const { data } = await locals.supabase.from('field_comments').select(COMMENT_SELECT).eq('id', id).single();
	if (!data) error(404, 'Comment not found');
	return json(toComment(data));
};
