// Save endpoints end-to-end: validation, permissions, and concurrent edits on one shared account.
// Needs a running dev server (STUDIO_URL) and seeded data.
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, creds, login, serverUp } from './helpers';

const admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const productOf = async (team: string) => (await admin.from('teams').select('id, products(id)').eq('name', team).single()).data as any;

describe.skipIf(!creds.length)('save endpoints (needs dev server)', () => {
	let up = false;
	let laptopA = '';
	let laptopB = '';
	let mentor = '';
	let nestled: { id: string; products: { id: string } };
	let onboard: { id: string; products: { id: string } };
	const KEY = 'di.objectives';

	beforeAll(async () => {
		up = await serverUp();
		if (!up) return;
		// Two independent sign-ins to the same shared team account = two teammates on two laptops.
		laptopA = (await login('Nestled')).cookie;
		laptopB = (await login('Nestled')).cookie;
		mentor = (await login('Priya Raman')).cookie;
		nestled = await productOf('Nestled');
		onboard = await productOf('Onboard');
		await admin.from('product_fields').delete().eq('product_id', nestled.products.id).eq('field_key', KEY);
	});
	afterAll(async () => {
		if (up) await admin.from('product_fields').delete().eq('product_id', nestled.products.id).eq('field_key', KEY);
	});

	it('two teammates editing one field: the second stale save is a conflict, not an overwrite', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		const a = await api(laptopA, 'POST', '/api/product/fields', { productId: pid, key: KEY, value: 'from A', evidence: null, expectedVersion: 0 });
		expect(a.body).toMatchObject({ ok: true, field: { version: 1 } });
		// Laptop B loaded the page before A saved, so it still thinks the field is new (version 0).
		const b = await api(laptopB, 'POST', '/api/product/fields', { productId: pid, key: KEY, value: 'from B', evidence: null, expectedVersion: 0 });
		expect(b.body).toMatchObject({ ok: false, reason: 'conflict', field: { value: 'from A', version: 1 } });
		// B chooses "Keep mine": retries with the version it was shown.
		const keep = await api(laptopB, 'POST', '/api/product/fields', { productId: pid, key: KEY, value: 'from B', evidence: null, expectedVersion: 1 });
		expect(keep.body).toMatchObject({ ok: true, field: { value: 'from B', version: 2 } });
	});

	it('rejects unknown fields, bad options and non-http links', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		expect((await api(laptopA, 'POST', '/api/product/fields', { productId: pid, key: 'xx.evil', value: 'x', expectedVersion: 0 })).status).toBe(400);
		expect((await api(laptopA, 'POST', '/api/product/fields', { productId: pid, key: 'ov.status', value: 'Not an option', expectedVersion: 0 })).status).toBe(400);
		expect((await api(laptopA, 'POST', '/api/product/fields', { productId: pid, key: 'ov.prototype', value: 'javascript:alert(1)', expectedVersion: 0 })).status).toBe(400);
	});

	it("blocks saving to another team's product and blocks mentors from editing", async (ctx) => {
		if (!up) ctx.skip();
		const other = await api(laptopA, 'POST', '/api/product/fields', { productId: onboard.products.id, key: KEY, value: 'x', evidence: null, expectedVersion: 0 });
		expect(other.status).toBe(403);
		const m = await api(mentor, 'POST', '/api/product/fields', { productId: nestled.products.id, key: KEY, value: 'x', evidence: null, expectedVersion: 2 });
		expect(m.status).toBe(403);
	});

	it('requires sign-in', async (ctx) => {
		if (!up) ctx.skip();
		expect((await api('', 'POST', '/api/product/fields', { productId: nestled.products.id, key: KEY, value: 'x', expectedVersion: 0 })).status).toBe(401);
	});

	it('log rows: create, version-checked update, conflict, delete', async (ctx) => {
		if (!up) ctx.skip();
		const created = await api(laptopA, 'POST', '/api/product/logs', { productId: nestled.products.id, kind: 'competitor', position: 99 });
		expect(created.status).toBe(200);
		const id = created.body.id;
		const u1 = await api(laptopA, 'PATCH', '/api/product/logs', { id, kind: 'competitor', data: { name: 'Test Co', junk: 'dropped' }, expectedVersion: 1 });
		expect(u1.body).toMatchObject({ ok: true, entry: { version: 2, data: { name: 'Test Co' } } });
		expect(u1.body.entry.data.junk).toBeUndefined();
		const stale = await api(laptopB, 'PATCH', '/api/product/logs', { id, kind: 'competitor', data: { name: 'Stale' }, expectedVersion: 1 });
		expect(stale.body).toMatchObject({ ok: false, reason: 'conflict', entry: { data: { name: 'Test Co' } } });
		expect((await api(laptopA, 'DELETE', '/api/product/logs', { id })).status).toBe(200);
	});

	it('decisions and tasks round-trip', async (ctx) => {
		if (!up) ctx.skip();
		const d = await api(laptopA, 'POST', '/api/product/decisions', { productId: nestled.products.id, title: 'Test decision', phase: 'scope', status: 'proposed' });
		expect(d.body).toMatchObject({ ok: true, decision: { title: 'Test decision', version: 1 } });
		const u = await api(laptopA, 'PATCH', '/api/product/decisions', { ...d.body.decision, status: 'accepted' });
		expect(u.body).toMatchObject({ ok: true, decision: { status: 'accepted', version: 2 } });
		expect((await api(laptopA, 'DELETE', '/api/product/decisions', { id: d.body.decision.id })).status).toBe(200);

		const t = await api(laptopA, 'POST', '/api/tasks', { teamId: nestled.id, title: 'Test task' });
		expect(t.status).toBe(200);
		const done = await api(laptopA, 'PATCH', '/api/tasks', { id: t.body.id, status: 'done' });
		expect(done.body.status).toBe('done');
		expect((await api(laptopA, 'DELETE', '/api/tasks', { id: t.body.id })).status).toBe(200);
		// Can't create tasks for another team.
		expect((await api(laptopA, 'POST', '/api/tasks', { teamId: onboard.id, title: 'x' })).status).toBe(403);
	});
});
