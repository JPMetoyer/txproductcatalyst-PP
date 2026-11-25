// Smoke-crawls every page as each role: no server errors, no broken redirects.
// Needs a running dev server (STUDIO_URL) and seeded data.
import { createClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';
import { creds, get, login, serverUp } from './helpers';

const admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

describe.skipIf(!creds.length)('page crawl (needs dev server)', () => {
	let up = false;
	let ids: { team: string; challenge: string; lesson: string };
	beforeAll(async () => {
		up = await serverUp();
		const team = (await admin.from('teams').select('id').eq('name', 'Nestled').single()).data!;
		const challenge = (await admin.from('challenges').select('id').eq('published', true).limit(1).single()).data!;
		const lesson = (await admin.from('lessons').select('id').eq('published', true).limit(1).single()).data!;
		ids = { team: team.id, challenge: challenge.id, lesson: lesson.id };
	});

	const crawl = async (who: string, paths: string[]) => {
		const { cookie } = await login(who);
		const problems: string[] = [];
		for (const p of paths) {
			const res = await get(p, cookie);
			const html = res.status === 200 ? await res.text() : '';
			if (res.status !== 200 || html.includes('Internal Error')) problems.push(`${p} → ${res.status}${html.includes('Internal Error') ? ' (Internal Error)' : ''}`);
		}
		expect(problems).toEqual([]);
	};

	it('team pages', async (ctx) => {
		if (!up) ctx.skip();
		await crawl('Nestled', [
			'/home', '/challenges', `/challenges/${ids.challenge}`, '/product/overview', '/product/discover', '/product/position', '/product/monetize',
			'/product/scope', '/product/build', '/product/validate', '/product/showcase', '/product/decisions', '/product/tools/business-model',
			'/product/tools/feasibility', '/academy', `/academy/${ids.lesson}`, '/career', '/demo-day', '/settings'
		]);
	});
	it('mentor pages', async (ctx) => {
		if (!up) ctx.skip();
		const t = ids.team;
		await crawl('Priya Raman', ['/mentor', '/mentor/teams', `/mentor/teams/${t}`, `/mentor/teams/${t}?tab=docs`, `/mentor/teams/${t}?tab=decisions`, `/mentor/teams/${t}?tab=review`, '/mentor/reviews', '/mentor/academy', `/mentor/academy/${ids.lesson}`]);
	});
	it('admin pages', async (ctx) => {
		if (!up) ctx.skip();
		await crawl('Academics Committee', [
			'/admin', '/admin/teams', '/admin/mentors', '/admin/semester', '/admin/challenges', `/admin/challenges/${ids.challenge}`, '/admin/challenges/new',
			'/admin/curriculum', `/admin/curriculum/${ids.lesson}`, '/admin/curriculum/new', '/admin/milestones', '/admin/career', '/admin/demo-day'
		]);
	});
	it('signed-out pages', async (ctx) => {
		if (!up) ctx.skip();
		for (const p of ['/login', '/challenges', `/challenges/${ids.challenge}`, '/api/health']) expect((await get(p, '')).status, p).toBe(200);
		expect((await get('/', '')).headers.get('location')).toBe('/login');
		expect((await get('/does-not-exist', '')).status).toBe(404);
	});
});
