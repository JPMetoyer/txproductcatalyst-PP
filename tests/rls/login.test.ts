// End-to-end login + route-guard check against a running dev server.
// Run: STUDIO_URL=http://localhost:5173 npm run test:rls   (skipped when the server isn't reachable)
import { beforeAll, describe, expect, it } from 'vitest';
import { creds, get, login, serverUp } from './helpers';

let up = false;
beforeAll(async () => {
	up = await serverUp();
});

describe.skipIf(!creds.length)('login and route guards (needs dev server)', () => {
	it('rejects a wrong password with a generic message', async (ctx) => {
		if (!up) ctx.skip();
		const { json } = await login('Nestled', 'definitely-wrong');
		expect(JSON.stringify(json)).toContain('don’t match');
	});

	it('team signs in, sees its own team, and is kept out of mentor/admin pages', async (ctx) => {
		if (!up) ctx.skip();
		const { cookie, json } = await login('Nestled');
		expect(json?.location ?? json?.type).toBeTruthy();
		const home = await get('/home', cookie);
		expect(home.status).toBe(200);
		expect(await home.text()).toContain('Nestled');
		expect((await get('/admin', cookie)).headers.get('location')).toBe('/home');
		expect((await get('/mentor', cookie)).headers.get('location')).toBe('/home');
	});

	it('mentor lands on the mentor dashboard and cannot open team or admin pages', async (ctx) => {
		if (!up) ctx.skip();
		const { cookie } = await login('Priya Raman');
		const page = await get('/mentor', cookie);
		expect(page.status).toBe(200);
		expect(await page.text()).toContain('Priya Raman');
		expect((await get('/home', cookie)).headers.get('location')).toBe('/mentor');
		expect((await get('/admin/teams', cookie)).headers.get('location')).toBe('/mentor');
	});

	it('admin sees real teams on Admin → Teams', async (ctx) => {
		if (!up) ctx.skip();
		const { cookie } = await login('Academics Committee');
		const page = await get('/admin/teams', cookie);
		expect(page.status).toBe(200);
		const html = await page.text();
		for (const t of creds.filter((c) => c.role === 'team')) expect(html).toContain(t.name);
	});

	it('each team sees its own real content on every team page', async (ctx) => {
		if (!up) ctx.skip();
		const pals = (await login('Paycheck Pals')).cookie;
		for (const path of ['/home', '/challenges', '/product/overview', '/product/discover', '/product/decisions', '/academy']) {
			const res = await get(path, pals);
			expect(res.status, path).toBe(200);
			const html = await res.text();
			expect(html, path).toContain('Paycheck Pals');
			expect(html, path).not.toContain('shared move-in hub'); // Nestled's private description
		}
		expect(await (await get('/home', pals)).text()).toContain('Financial Independence');

		const nestled = (await login('Nestled')).cookie;
		expect(await (await get('/product/overview', nestled)).text()).toContain('shared move-in hub');
	});

	it('signed-out visitors are sent to login with a return path', async (ctx) => {
		if (!up) ctx.skip();
		const res = await get('/product/discover', '');
		expect(res.headers.get('location')).toBe('/login?next=%2Fproduct%2Fdiscover');
	});
});
