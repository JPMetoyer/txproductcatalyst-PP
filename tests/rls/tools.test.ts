// Phase 4: Business Model Studio, Feasibility Explorer, lessons, Career Center, Demo Day.
// Needs a running dev server (STUDIO_URL) and seeded data.
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { action, api, creds, get, login, serverUp } from './helpers';

const admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

describe.skipIf(!creds.length)('Phase 4 tools (needs dev server)', () => {
	let up = false;
	let laptopA = '';
	let laptopB = '';
	let priya = '';
	let academics = '';
	let nestled: any;
	let semester: any;
	const cleanup: (() => PromiseLike<unknown>)[] = [];

	beforeAll(async () => {
		up = await serverUp();
		if (!up) return;
		laptopA = (await login('Nestled')).cookie;
		laptopB = (await login('Nestled')).cookie;
		priya = (await login('Priya Raman')).cookie;
		academics = (await login('Academics Committee')).cookie;
		nestled = (await admin.from('teams').select('id, products(id)').eq('name', 'Nestled').single()).data;
		semester = (await admin.from('semesters').select('id, demo_day').eq('status', 'active').single()).data;
		await admin.from('business_model_scenarios').delete().eq('product_id', nestled.products.id);
		await admin.from('feasibility_assessments').delete().eq('product_id', nestled.products.id);
		cleanup.push(() => admin.from('business_model_scenarios').delete().eq('product_id', nestled.products.id));
		cleanup.push(() => admin.from('feasibility_assessments').delete().eq('product_id', nestled.products.id));
		cleanup.push(() => admin.from('team_demo_day').delete().eq('team_id', nestled.id));
		cleanup.push(() => admin.from('semesters').update({ demo_day: semester.demo_day }).eq('id', semester.id));
	});
	afterAll(async () => {
		for (const fn of cleanup.reverse()) await fn();
	});

	it('Business Model Studio: saves, sanitizes, detects conflicts, blocks mentors', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		const page = await get('/product/tools/business-model', laptopA);
		expect(page.status).toBe(200);
		expect(await page.text()).toContain('Estimates, not forecasts');

		const a = await api(laptopA, 'POST', '/api/product/business-model', { productId: pid, expectedVersion: 0, assumptions: { subscription: { enabled: true, potentialCustomers: 2000, conversionRate: 5, monthlyPrice: -3 } } });
		expect(a.body).toMatchObject({ ok: true, version: 1, assumptions: { subscription: { monthlyPrice: 0 } } });
		const stale = await api(laptopB, 'POST', '/api/product/business-model', { productId: pid, expectedVersion: 0, assumptions: {} });
		expect(stale.body).toMatchObject({ ok: false, reason: 'conflict', version: 1 });
		expect((await api(priya, 'POST', '/api/product/business-model', { productId: pid, expectedVersion: 1, assumptions: {} })).status).toBe(403);
	});

	it('Feasibility Explorer: saves per area with version checks, no overall score', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		expect(await (await get('/product/tools/feasibility', laptopA)).text()).toContain('no overall score');
		const ok = await api(laptopA, 'POST', '/api/product/feasibility', { productId: pid, area: 'data', status: 'blocker', notes: 'No public rent data', evidence: '', expectedVersion: 0 });
		expect(ok.body).toMatchObject({ ok: true, version: 1 });
		const stale = await api(laptopB, 'POST', '/api/product/feasibility', { productId: pid, area: 'data', status: 'supported', notes: '', evidence: '', expectedVersion: 0 });
		expect(stale.body).toMatchObject({ ok: false, current: { status: 'blocker' } });
		expect((await api(laptopA, 'POST', '/api/product/feasibility', { productId: pid, area: 'vibes', status: 'supported', expectedVersion: 0 })).status).toBe(400);
		expect((await api(priya, 'POST', '/api/product/feasibility', { productId: pid, area: 'data', status: 'supported', expectedVersion: 1 })).status).toBe(403);
	});

	it('lesson pages: published GMs open, unpublished ones 404', async (ctx) => {
		if (!up) ctx.skip();
		const lessons = (await admin.from('lessons').select('id, title, published').eq('semester_id', semester.id)).data!;
		const pub = lessons.find((l) => l.published)!;
		const draft = lessons.find((l) => !l.published)!;
		const res = await get(`/academy/${pub.id}`, laptopA);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain(pub.title);
		expect((await get(`/academy/${draft.id}`, laptopA)).status).toBe(404);
		expect((await get(`/mentor/academy/${pub.id}`, priya)).status).toBe(200);
	});

	it('Career Center: admins add items, teams see them', async (ctx) => {
		if (!up) ctx.skip();
		const title = `Test career question ${Date.now()}`;
		expect((await action(academics, '/admin/career?/save', { section: 'metrics', title, body: '', url: '' })).type).toBe('success');
		cleanup.push(() => admin.from('resources').delete().eq('title', title));
		const html = await (await get('/career', laptopA)).text();
		expect(html).toContain('Interview frameworks');
		// Section content renders client-side per tab; the item is in the page data.
		expect(html).toContain(title);
		expect((await action(priya, '/admin/career?/save', { section: 'metrics', title: 'x' })).type).not.toBe('success');
	});

	it('Demo Day: admins configure, teams set readiness, mentors see it', async (ctx) => {
		if (!up) ctx.skip();
		const save = await action(academics, '/admin/demo-day?/save', {
			semesterId: semester.id, date: '2027-04-24', time: '6–8 PM', location: 'Test Hall', instructions: 'Seven minutes each.',
			rubricLabel: 'Problem', rubricPoints: '60', rubricDesc: '', checklist: 'Rehearse\nTest prototype', judgeQuestions: 'Why now?', resources: ''
		});
		expect(save.type).toBe('success');
		const page = await (await get('/demo-day', laptopA)).text();
		expect(page).toContain('Test Hall');
		expect(page).toContain('Rehearse');

		expect((await action(laptopA, '/demo-day?/readiness', { readiness: 'ready' })).type).toBe('success');
		expect((await action(laptopA, '/demo-day?/checklist', { item: 'Rehearse' })).type).toBe('success');
		const prep = (await admin.from('team_demo_day').select('readiness, checked').eq('team_id', nestled.id).single()).data!;
		expect(prep).toEqual({ readiness: 'ready', checked: ['Rehearse'] });
		expect(await (await get('/mentor', priya)).text()).toContain('Demo Day: Ready');
		expect((await action(laptopA, '/demo-day?/readiness', { readiness: 'done-ish' })).type).toBe('failure');
	});
});
