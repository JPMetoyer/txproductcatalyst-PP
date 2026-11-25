import { describe, expect, it } from 'vitest';
import { applySave } from './field-store';
import type { ProductFields } from '$lib/types/domain';

describe('applySave (concurrent edit protection)', () => {
	it('creates a new field at version 1', () => {
		const fields: ProductFields = {};
		const r = applySave(fields, 'a', { value: 'x', evidence: null }, 0);
		expect(r.ok).toBe(true);
		expect(fields.a.version).toBe(1);
	});

	it('increments version on a save with the current version', () => {
		const fields: ProductFields = { a: { value: 'x', evidence: null, version: 3, updatedAt: '' } };
		const r = applySave(fields, 'a', { value: 'y', evidence: 'validated' }, 3);
		expect(r.ok).toBe(true);
		expect(fields.a).toMatchObject({ value: 'y', evidence: 'validated', version: 4 });
	});

	it('rejects a stale save and does not overwrite newer work', () => {
		const fields: ProductFields = { a: { value: 'teammate edit', evidence: null, version: 5, updatedAt: '' } };
		const r = applySave(fields, 'a', { value: 'my stale edit', evidence: null }, 4);
		expect(r.ok).toBe(false);
		if (!r.ok && r.reason === 'conflict') expect(r.current.value).toBe('teammate edit');
		expect(fields.a.value).toBe('teammate edit');
	});

	it('saves to different fields independently', () => {
		const fields: ProductFields = { a: { value: 1, evidence: null, version: 2, updatedAt: '' } };
		expect(applySave(fields, 'b', { value: 2, evidence: null }, 0).ok).toBe(true);
		expect(fields.a.version).toBe(2);
	});
});
