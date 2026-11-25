// Optimistic-concurrency field store (PLAN.md R4).
// Pure logic, framework-agnostic so it can be unit-tested and reused by the Supabase
// implementation (where `persist` becomes the `save_field` RPC).

import type { ProductFields, ProductFieldValue } from '$lib/types/domain';

export type SaveResult =
	| { ok: true; field: ProductFieldValue }
	| { ok: false; reason: 'conflict'; current: ProductFieldValue }
	| { ok: false; reason: 'error'; message: string };

/**
 * Server-side semantics of `save_field(product_id, key, value, expected_version)`:
 * only writes if the stored version equals the version the client last saw.
 */
export function applySave(
	fields: ProductFields,
	key: string,
	patch: Pick<ProductFieldValue, 'value' | 'evidence'>,
	expectedVersion: number,
	now: string = new Date().toISOString()
): SaveResult {
	const current = fields[key];
	const currentVersion = current?.version ?? 0;
	if (currentVersion !== expectedVersion) {
		return { ok: false, reason: 'conflict', current: current! };
	}
	const next: ProductFieldValue = { ...patch, version: currentVersion + 1, updatedAt: now };
	fields[key] = next;
	return { ok: true, field: next };
}
