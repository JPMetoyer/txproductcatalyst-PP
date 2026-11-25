// Phase 3 (part B): admin content editors. Needs a running dev server (STUDIO_URL) and seeded data.
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { action, creds, get, login, serverUp } from './helpers';

const admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const stamp = Date.now();

describe.skipIf(!creds.length)('admin content editors (needs dev server)', () => {
	let up = false;
	let academics = '';
	let priya = '';
	let nestledCookie = '';
	let active: { id: string; name: string };
	const cleanup: (() => PromiseLike<unknown>)[] = [];

	beforeAll(async () => {
		up = await serverUp();
		if (!up) return;
		academics = (await login('Academics Committee')).cookie;
		priya = (await login('Priya Raman')).cookie;
		nestledCookie = (await login('Nestled')).cookie;
		active = (await admin.from('semesters').select('id, name').eq('status', 'active').single()).data!;
	});
	afterAll(async () => {
		for (const fn of cleanup.reverse()) await fn();
	});

	it('semesters: create upcoming (copying content), edit, and one-active rule', async (ctx) => {
		if (!up) ctx.skip();
		const name = `Test Sem ${stamp}`;
		const r = await action(academics, '/admin/semester?/create', { name, theme: 'Testing', startDate: '2027-08-20', endDate: '2027-12-10', copyFrom: active.id });
		expect(r.type).toBe('success');
		const sem = (await admin.from('semesters').select('id, status').eq('name', name).single()).data!;
		cleanup.push(async () => {
			for (const t of ['challenges', 'lessons', 'milestones']) await admin.from(t).delete().eq('semester_id', sem.id);
			await admin.from('semesters').delete().eq('id', sem.id);
		});
		expect(sem.status).toBe('upcoming');
		const copied = (await admin.from('challenges').select('published').eq('semester_id', sem.id)).data!;
		expect(copied.length).toBeGreaterThan(0);
		expect(copied.every((c) => !c.published)).toBe(true);
		const lessons = (await admin.from('lessons').select('scheduled_date').eq('semester_id', sem.id)).data!;
		expect(lessons.every((l) => l.scheduled_date === null)).toBe(true);

		expect((await action(academics, '/admin/semester?/update', { id: sem.id, name, theme: 'Edited', startDate: '2027-08-20', endDate: '2027-12-10' })).type).toBe('success');
		expect((await admin.from('semesters').select('theme').eq('id', sem.id).single()).data!.theme).toBe('Edited');
		// Can't activate while another semester is active.
		expect((await action(academics, '/admin/semester?/activate', { id: sem.id })).type).toBe('failure');
		// End date before start is rejected.
		expect((await action(academics, '/admin/semester?/update', { id: sem.id, name, theme: '', startDate: '2027-12-10', endDate: '2027-08-20' })).type).toBe('failure');
	});

	it('challenges: create draft, publish to teams, block deleting assigned ones', async (ctx) => {
		if (!up) ctx.skip();
		const title = `Test Challenge ${stamp}`;
		const r = await action(academics, `/admin/challenges/new?/save&semester=${active.id}`, {
			semesterId: active.id, code: `T-${stamp % 10000}`, title, summary: 's', icon: 'map', accent: 'pink', stakeholders: 'A\nB\n\n', expectations: 'X'
		});
		expect(r.type).toBe('redirect');
		const c = (await admin.from('challenges').select('id, published, stakeholders').eq('title', title).single()).data!;
		cleanup.push(() => admin.from('challenges').delete().eq('id', c.id));
		expect(c).toMatchObject({ published: false, stakeholders: ['A', 'B'] });
		expect(await (await get('/challenges', nestledCookie)).text()).not.toContain(title);

		expect((await action(academics, '/admin/challenges?/publish', { id: c.id, published: 'true' })).type).toBe('success');
		expect(await (await get('/challenges', nestledCookie)).text()).toContain(title);

		const assigned = (await admin.from('teams').select('challenge_id').eq('name', 'Nestled').single()).data!.challenge_id;
		expect((await action(academics, '/admin/challenges?/delete', { id: assigned })).type).toBe('failure');
		expect((await action(academics, '/admin/challenges?/delete', { id: c.id })).type).toBe('success');
	});

	it('curriculum: unpublished GMs are hidden from teams; reorder swaps numbers', async (ctx) => {
		if (!up) ctx.skip();
		const mk = async (gm: number, title: string) => {
			expect((await action(academics, `/admin/curriculum/new?/save&semester=${active.id}`, { semesterId: active.id, gmNumber: String(gm), title, topics: 'One\nTwo' })).type).toBe('redirect');
			return (await admin.from('lessons').select('id, gm_number').eq('title', title).single()).data!;
		};
		const a = await mk(18, `Test GM A ${stamp}`);
		const b = await mk(19, `Test GM B ${stamp}`);
		cleanup.push(() => admin.from('lessons').delete().in('id', [a.id, b.id]));
		expect(await (await get('/academy', nestledCookie)).text()).not.toContain(`Test GM A ${stamp}`);
		// Duplicate GM number is rejected.
		expect((await action(academics, `/admin/curriculum/new?/save&semester=${active.id}`, { semesterId: active.id, gmNumber: '18', title: 'dup' })).type).toBe('failure');

		expect((await action(academics, '/admin/curriculum?/publish', { id: a.id, published: 'true' })).type).toBe('success');
		expect(await (await get('/academy', nestledCookie)).text()).toContain(`Test GM A ${stamp}`);

		expect((await action(academics, '/admin/curriculum?/move', { id: a.id, otherId: b.id })).type).toBe('success');
		const after = (await admin.from('lessons').select('id, gm_number').in('id', [a.id, b.id])).data!;
		expect(after.find((x) => x.id === a.id)!.gm_number).toBe(19);
		expect(after.find((x) => x.id === b.id)!.gm_number).toBe(18);
	});

	it('milestones: create, reject duplicates, protect reviewed ones', async (ctx) => {
		if (!up) ctx.skip();
		const title = `Test Milestone ${stamp}`;
		expect((await action(academics, '/admin/milestones?/save', { semesterId: active.id, number: '9', title, reviewQuestions: 'Q1\nQ2', relatedPhases: 'build' })).type).toBe('success');
		const m = (await admin.from('milestones').select('id, review_questions, related_phases').eq('title', title).single()).data!;
		cleanup.push(() => admin.from('milestones').delete().eq('id', m.id));
		expect(m).toMatchObject({ review_questions: ['Q1', 'Q2'], related_phases: ['build'] });
		expect((await action(academics, '/admin/milestones?/save', { semesterId: active.id, number: '9', title: 'dup' })).type).toBe('failure');

		const m1 = (await admin.from('milestones').select('id').eq('semester_id', active.id).eq('number', 1).single()).data!;
		expect((await action(academics, '/admin/milestones?/delete', { id: m1.id })).type).toBe('failure');
		expect((await action(academics, '/admin/milestones?/delete', { id: m.id })).type).toBe('success');
	});

	it('non-admins cannot use the editors', async (ctx) => {
		if (!up) ctx.skip();
		for (const path of ['/admin/semester?/create', '/admin/challenges?/publish', '/admin/curriculum?/publish', '/admin/milestones?/save']) {
			expect((await action(priya, path, { name: 'x', id: crypto.randomUUID(), published: 'true', number: '9', title: 'x' })).type, path).not.toBe('success');
		}
	});
});
