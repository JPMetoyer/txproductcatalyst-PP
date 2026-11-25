// End-to-end login + route-guard check against a running dev server.
// Run: STUDIO_URL=http://localhost:5173 npm run test:rls   (skipped when the server isn't reachable)
import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

type Cred = { role: string; name: string; email: string; password: string };
const creds: Cred[] = existsSync('.seed-credentials.json') ? JSON.parse(readFileSync('.seed-credentials.json', 'utf8')) : [];
const base = process.env.STUDIO_URL ?? 'http://localhost:5173';

let up = false;
beforeAll(async () => {
	up = await fetch(`${base}/login`).then((r) => r.ok).catch(() => false);
});

/** Signs in through the real /login form action; returns the session cookie header. */
async function login(name: string, password?: string) {
	const c = creds.find((x) => x.name === name)!;
	const body = new URLSearchParams({ login: c.email.split('@')[0], password: password ?? c.password });
	const res = await fetch(`${base}/login`, {
		method: 'POST',
		body,
		headers: { origin: base, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
		redirect: 'manual'
	});
	const cookie = res.headers.getSetCookie().map((h) => h.split(';')[0]).join('; ');
	return { res, cookie, json: res.headers.get('content-type')?.includes('json') ? await res.json() : null };
}
const get = (path: string, cookie: string) => fetch(`${base}${path}`, { headers: { cookie }, redirect: 'manual' });

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

	it('signed-out visitors are sent to login with a return path', async (ctx) => {
		if (!up) ctx.skip();
		const res = await get('/product/discover', '');
		expect(res.headers.get('location')).toBe('/login?next=%2Fproduct%2Fdiscover');
	});
});
