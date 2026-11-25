// Phase 3: comment threads, support flags, phase setting, renaming, roster changes.
// Needs a running dev server (STUDIO_URL) and seeded data.
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { action, api, creds, get, login, serverUp } from './helpers';

const admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const team = async (name: string) => (await admin.from('teams').select('id, name, current_phase, products(id)').eq('name', name).single()).data as any;

describe.skipIf(!creds.length)('mentorship features (needs dev server)', () => {
	let up = false;
	let nestledCookie = '';
	let priya = '';
	let marcus = '';
	let academics = '';
	let nestled: any;
	let onboard: any;
	const cleanup: (() => Promise<unknown>)[] = [];

	beforeAll(async () => {
		up = await serverUp();
		if (!up) return;
		nestledCookie = (await login('Nestled')).cookie;
		priya = (await login('Priya Raman')).cookie; // mentors Nestled
		marcus = (await login('Marcus Lee')).cookie; // does not mentor Nestled
		academics = (await login('Academics Committee')).cookie;
		nestled = await team('Nestled');
		onboard = await team('Onboard');
	});
	afterAll(async () => {
		for (const fn of cleanup.reverse()) await fn();
	});

	it('comment threads: mentor starts, team replies and resolves, mentor reopens', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		const start = await api(priya, 'POST', '/api/comments', { productId: pid, fieldKey: 'di.findings', body: 'How many interviews back this?' });
		expect(start.status).toBe(200);
		const root = start.body.id;
		cleanup.push(() => admin.from('field_comments').delete().eq('id', root));

		const reply = await api(nestledCookie, 'POST', '/api/comments', { productId: pid, fieldKey: 'di.findings', body: '11 interviews.', parentId: root });
		expect(reply.body).toMatchObject({ parentId: root, authorRole: 'team' });

		const resolved = await api(nestledCookie, 'PATCH', '/api/comments', { id: root, resolved: true });
		expect(resolved.body).toMatchObject({ resolved: true });
		expect(resolved.body.resolvedAt).toBeTruthy();

		const reopened = await api(priya, 'PATCH', '/api/comments', { id: root, resolved: false });
		expect(reopened.body).toMatchObject({ resolved: false, resolvedAt: null });

		// Resolved threads stay in history: the comment still exists after resolving.
		const { count } = await admin.from('field_comments').select('id', { count: 'exact', head: true }).eq('id', root);
		expect(count).toBe(1);
	});

	it('teams can only reply, not start threads; outsiders cannot comment', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		expect((await api(nestledCookie, 'POST', '/api/comments', { productId: pid, fieldKey: 'di.findings', body: 'new thread' })).status).toBe(403);
		expect((await api(marcus, 'POST', '/api/comments', { productId: pid, fieldKey: 'di.findings', body: 'hi' })).status).toBe(403);
		expect((await api(nestledCookie, 'POST', '/api/comments', { productId: onboard.products.id, fieldKey: 'di.findings', body: 'x', parentId: crypto.randomUUID() })).status).toBe(403);
		expect((await api(priya, 'POST', '/api/comments', { productId: pid, fieldKey: 'xx.bad', body: 'x' })).status).toBe(400);
	});

	it('flags need a reason, show on the admin dashboard, and admins clear them', async (ctx) => {
		if (!up) ctx.skip();
		const short = await action(priya, `/mentor/teams/${nestled.id}?/flag`, { reason: 'x' });
		expect(short.type).toBe('failure');

		const reason = `Test flag ${Date.now()}`;
		expect((await action(priya, `/mentor/teams/${nestled.id}?/flag`, { reason })).type).toBe('success');
		const { data: flag } = await admin.from('team_flags').select('id, flagged_by').eq('reason', reason).single();
		cleanup.push(() => admin.from('team_flags').delete().eq('id', flag!.id));

		const dash = await (await get('/admin', academics)).text();
		expect(dash).toContain(reason);
		expect(dash).toContain('Priya Raman');

		// Teams can't see flags about themselves; unassigned mentors can't flag.
		const teamDb = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
		const c = creds.find((x) => x.name === 'Nestled')!;
		await teamDb.auth.signInWithPassword({ email: c.email, password: c.password });
		expect((await teamDb.from('team_flags').select('id')).data).toEqual([]);
		expect((await action(marcus, `/mentor/teams/${nestled.id}?/flag`, { reason: 'not my team' })).type).not.toBe('success');

		expect((await action(academics, '/admin?/clearFlag', { id: flag!.id })).type).toBe('success');
		const { data: after } = await admin.from('team_flags').select('cleared_at').eq('id', flag!.id).single();
		expect(after!.cleared_at).toBeTruthy();
	});

	it('mentors set the phase for assigned teams only', async (ctx) => {
		if (!up) ctx.skip();
		const original = nestled.current_phase;
		cleanup.push(() => admin.from('teams').update({ current_phase: original }).eq('id', nestled.id));
		expect((await action(priya, `/mentor/teams/${nestled.id}?/phase`, { phase: 'scope' })).type).toBe('success');
		expect((await team('Nestled')).current_phase).toBe('scope');
		expect((await action(marcus, `/mentor/teams/${nestled.id}?/phase`, { phase: 'build' })).type).not.toBe('success');
		expect((await team('Nestled')).current_phase).toBe('scope');
		// Teams can't call it directly either.
		expect((await action(nestledCookie, `/mentor/teams/${nestled.id}?/phase`, { phase: 'build' })).type).not.toBe('success');
	});

	it('teams rename themselves without affecting login or documentation', async (ctx) => {
		if (!up) ctx.skip();
		const before = (await admin.from('product_fields').select('id', { count: 'exact', head: true }).eq('product_id', nestled.products.id)).count;
		cleanup.push(() => admin.from('teams').update({ name: 'Nestled' }).eq('id', nestled.id));
		expect((await action(nestledCookie, '/settings?/renameTeam', { name: 'Nestled Labs' })).type).toBe('success');
		expect((await team('Nestled Labs'))?.id).toBe(nestled.id);
		// Duplicate names are rejected.
		expect((await action(nestledCookie, '/settings?/renameTeam', { name: 'Onboard' })).type).toBe('failure');
		// Same login still works, docs untouched.
		const relog = await login('Nestled');
		expect((await get('/home', relog.cookie)).status).toBe(200);
		const afterCount = (await admin.from('product_fields').select('id', { count: 'exact', head: true }).eq('product_id', nestled.products.id)).count;
		expect(afterCount).toBe(before);
	});

	it('admin roster changes never touch documentation', async (ctx) => {
		if (!up) ctx.skip();
		const pid = nestled.products.id;
		const before = (await admin.from('product_fields').select('id', { count: 'exact', head: true }).eq('product_id', pid)).count;
		const name = `Test Member ${Date.now()}`;
		expect((await action(academics, '/admin/teams?/addMember', { teamId: nestled.id, name })).type).toBe('success');
		const { data: m } = await admin.from('team_members').select('id').eq('name', name).single();
		cleanup.push(() => admin.from('team_members').delete().eq('name', name));

		// Move to Onboard without rotating credentials.
		expect((await action(academics, '/admin/teams?/changeMember', { memberId: m!.id, toTeamId: onboard.id })).type).toBe('success');
		const rows = (await admin.from('team_members').select('team_id, active').eq('name', name)).data!;
		expect(rows).toContainEqual({ team_id: nestled.id, active: false });
		expect(rows).toContainEqual({ team_id: onboard.id, active: true });

		const after = (await admin.from('product_fields').select('id', { count: 'exact', head: true }).eq('product_id', pid)).count;
		expect(after).toBe(before);
		// Non-admins can't change rosters.
		expect((await action(priya, '/admin/teams?/addMember', { teamId: nestled.id, name: 'x' })).type).not.toBe('success');
	});
});
