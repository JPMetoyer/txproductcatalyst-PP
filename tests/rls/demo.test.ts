// Checks the Fall 2026 demo environment (npm run demo:seed): every demo account reaches its dashboards,
// pages show the seeded records, and mentors still can't open teams they don't mentor.
// Needs a running server (STUDIO_URL) and .demo-credentials.json.
import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';
import { base, get, serverUp } from './helpers';

type Cred = { role: string; name: string; login: string; password: string };
const creds: Cred[] = existsSync('.demo-credentials.json') ? JSON.parse(readFileSync('.demo-credentials.json', 'utf8')) : [];
const db = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

async function signIn(c: Cred) {
	const res = await fetch(`${base}/login`, {
		method: 'POST',
		body: new URLSearchParams({ login: c.login, password: c.password }),
		headers: { origin: base, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
		redirect: 'manual'
	});
	return res.headers.getSetCookie().map((h) => h.split(';')[0]).join('; ');
}

async function page(cookie: string, path: string) {
	const res = await get(path, cookie);
	const html = res.status === 200 ? await res.text() : '';
	expect(res.status, path).toBe(200);
	expect(html, path).not.toContain('Internal Error');
	return html;
}

describe.skipIf(!creds.length)('Fall 2026 demo environment', () => {
	let up = false;
	let teams: { id: string; name: string; mentor: string }[] = [];
	let lesson = '';
	beforeAll(async () => {
		up = await serverUp();
		const sem = (await db.from('semesters').select('id').eq('demo', true).single()).data!;
		const rows = (await db.from('teams').select('id, name, team_mentors(profiles(display_name))').eq('semester_id', sem.id)).data as any[];
		teams = rows.map((t) => ({ id: t.id, name: t.name, mentor: t.team_mentors[0].profiles.display_name }));
		lesson = (await db.from('lessons').select('id').eq('semester_id', sem.id).eq('gm_number', 9).single()).data!.id;
	});

	it('every team account sees its own workspace', { timeout: 180_000 }, async (ctx) => {
		if (!up) ctx.skip();
		for (const c of creds.filter((x) => x.role === 'team')) {
			const cookie = await signIn(c);
			const team = teams.find((t) => c.name === `Team ${t.name} (demo)`)!;
			expect(await page(cookie, '/home'), c.name).toContain(team.name);
			for (const p of ['/product/overview', '/product/discover', '/product/validate', '/product/showcase', '/product/decisions', '/product/tools/business-model', '/product/tools/feasibility', '/demo-day', '/challenges', `/academy/${lesson}`, '/career']) await page(cookie, p);
		}
	});

	it('every mentor sees only their team', { timeout: 120_000 }, async (ctx) => {
		if (!up) ctx.skip();
		for (const c of creds.filter((x) => x.role === 'mentor')) {
			const cookie = await signIn(c);
			const mine = teams.find((t) => t.mentor === c.name)!;
			const other = teams.find((t) => t.mentor !== c.name)!;
			expect(await page(cookie, '/mentor'), c.name).toContain(mine.name);
			await page(cookie, `/mentor/teams/${mine.id}?tab=docs`);
			await page(cookie, `/mentor/teams/${mine.id}?tab=review`);
			expect((await get(`/mentor/teams/${other.id}`, cookie)).status, `${c.name} → ${other.name}`).not.toBe(200);
		}
	});

	it('admin overview reflects the stored records', { timeout: 120_000 }, async (ctx) => {
		if (!up) ctx.skip();
		const cookie = await signIn(creds.find((x) => x.role === 'admin')!);
		const html = await page(cookie, '/admin');
		expect(html).toContain('Fall 2026');
		expect(html).toContain('TechBridge'); // flagged for support
		expect(html).toContain('Recent documentation updates');
		expect(html.replace(/<!--[^>]*-->/g, '')).toMatch(/>23<\/strong><span[^>]*>Team members/);
		for (const p of ['/admin/teams', '/admin/mentors', '/admin/challenges', '/admin/curriculum', '/admin/milestones', '/admin/career', '/admin/demo-day']) await page(cookie, p);
	});
});
