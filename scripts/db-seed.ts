// Seeds a development database with the prototype's mock data and creates test accounts.
// Usage:
//   npm run db:seed            → seeds an empty database
//   npm run db:seed -- --reset → deletes seeded data + @studio test accounts first (DEV ONLY)
//
// Generated passwords are written to .seed-credentials.json (git-ignored). They are never printed.

import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import * as mock from './seed-data.ts';
import { ACCOUNT_DOMAIN, slugify } from '../src/lib/auth/accounts.ts';

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const reset = process.argv.includes('--reset');

function must<T>(r: { data: T; error: unknown }, what: string): NonNullable<T> {
	if (r.error) throw new Error(`${what}: ${JSON.stringify(r.error)}`);
	return r.data as NonNullable<T>;
}

const password = () => randomBytes(18).toString('base64url');

async function allSeedUsers() {
	const users = [];
	for (let page = 1; ; page++) {
		const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
		if (error) throw error;
		users.push(...data.users);
		if (data.users.length < 200) break;
	}
	return users.filter((u) => u.email?.endsWith('@' + ACCOUNT_DOMAIN));
}

async function wipe() {
	console.log('Resetting: removing seeded data and test accounts…');
	// Child tables first. Everything hangs off semesters/teams/products.
	for (const t of [
		'field_comments', 'product_fields', 'log_entries', 'product_decisions', 'feasibility_assessments',
		'business_model_scenarios', 'tasks', 'milestone_reviews', 'products', 'team_members', 'team_mentors',
		'resources', 'announcements', 'teams', 'lessons', 'milestones', 'challenges', 'semesters'
	]) {
		const col = t === 'team_mentors' ? 'team_id' : t === 'feasibility_assessments' ? 'product_id' : 'id';
		must(await db.from(t).delete().not(col, 'is', null), `wipe ${t}`);
	}
	for (const u of await allSeedUsers()) must(await db.auth.admin.deleteUser(u.id), `delete user ${u.email}`);
}

async function createAccount(email: string, displayName: string, role: 'team' | 'mentor' | 'admin') {
	const pw = password();
	const { user } = must(await db.auth.admin.createUser({ email, password: pw, email_confirm: true }), `create ${email}`);
	must(await db.from('profiles').insert({ id: user.id, display_name: displayName, role }), `profile ${email}`);
	return { id: user.id, email, password: pw };
}

async function main() {
	const existing = must(await db.from('semesters').select('id').limit(1), 'check semesters');
	if (existing.length && !reset) {
		console.log('Database already has data. Run `npm run db:seed -- --reset` to wipe and reseed (dev only).');
		return;
	}
	if (reset) await wipe();

	const id = new Map<string, string>(); // mock id → database id
	const s = mock.semester;
	const sem = must(
		await db.from('semesters').insert({ name: s.name, theme: s.theme, start_date: s.startDate, end_date: s.endDate, status: s.status, public_marketplace: s.publicMarketplace }).select('id').single(),
		'semester'
	);
	id.set(s.id, sem.id);

	const ch = must(
		await db
			.from('challenges')
			.insert(
				mock.challenges.map((c, i) => ({
					semester_id: sem.id, code: c.code, title: c.title, summary: c.summary, icon: c.icon, accent: c.accent,
					experience: c.experience, mission: c.mission, stakeholders: c.stakeholders,
					research_considerations: c.researchConsiderations, boundaries: c.boundaries, expectations: c.expectations,
					published: c.published, position: i
				}))
			)
			.select('id, code'),
		'challenges'
	);
	for (const c of mock.challenges) id.set(c.id, ch.find((x) => x.code === c.code)!.id);

	const ms = must(
		await db
			.from('milestones')
			.insert(mock.milestones.map((m) => ({
				semester_id: sem.id, number: m.number, title: m.title, after_gm: m.afterGm, target_date: m.targetDate,
				review_areas: m.reviewAreas, review_questions: m.reviewQuestions, related_phases: m.relatedPhases
			})))
			.select('id, number'),
		'milestones'
	);
	for (const m of mock.milestones) id.set(m.id, ms.find((x) => x.number === m.number)!.id);

	must(
		await db.from('lessons').insert(mock.lessons.map((l, i) => ({
			semester_id: sem.id, gm_number: l.gmNumber, title: l.title, scheduled_date: l.scheduledDate, description: l.description,
			content: { topics: l.topics }, related_phase: l.relatedPhase, published: l.published, position: i
		}))),
		'lessons'
	);
	must(await db.from('announcements').insert(mock.announcements.map((a) => ({ semester_id: sem.id, title: a.title, body: a.body, published_at: a.publishedAt }))), 'announcements');

	// Accounts
	const creds: { role: string; name: string; email: string; password: string }[] = [];
	const admin = await createAccount(`admin@${ACCOUNT_DOMAIN}`, 'Academics Committee', 'admin');
	creds.push({ role: 'admin', name: 'Academics Committee', ...admin });
	for (const m of mock.mentors) {
		const acct = await createAccount(`mentor-${slugify(m.displayName)}@${ACCOUNT_DOMAIN}`, m.displayName, 'mentor');
		id.set(m.id, acct.id);
		creds.push({ role: 'mentor', name: m.displayName, ...acct });
	}

	for (const t of mock.teams) {
		const acct = await createAccount(`team-${slugify(t.name)}@${ACCOUNT_DOMAIN}`, `Team ${t.name}`, 'team');
		creds.push({ role: 'team', name: t.name, ...acct });
		const team = must(
			await db.from('teams').insert({ semester_id: sem.id, name: t.name, account_profile_id: acct.id, challenge_id: id.get(t.challengeId ?? '') ?? null, current_phase: t.currentPhase }).select('id').single(),
			`team ${t.name}`
		);
		id.set(t.id, team.id);
		must(await db.from('team_mentors').insert(t.mentorIds.map((m) => ({ team_id: team.id, mentor_profile_id: id.get(m)! }))), 'team mentors');
		const members = mock.teamMembers.filter((m) => m.teamId === t.id);
		const rows = must(await db.from('team_members').insert(members.map((m) => ({ team_id: team.id, name: m.name }))).select('id, name'), 'roster');
		for (const m of members) id.set(m.id, rows.find((r) => r.name === m.name)!.id);
		const product = must(await db.from('products').insert({ team_id: team.id }).select('id').single(), 'product');
		id.set(`product:${t.id}`, product.id);
	}

	// Documentation for teams that have mock content
	for (const p of mock.products) {
		const pid = id.get(`product:${p.teamId}`)!;
		must(await db.from('product_fields').insert(Object.entries(p.fields).map(([k, f]) => ({ product_id: pid, field_key: k, value: f.value, evidence: f.evidence }))), 'fields');
		must(await db.from('log_entries').insert(p.logs.map((l) => ({ product_id: pid, kind: l.kind, data: l.data, position: l.position }))), 'logs');
		must(await db.from('product_decisions').insert(p.decisions.map((d) => ({
			product_id: pid, title: d.title, decided_on: d.date, phase: d.phase, description: d.description, alternatives: d.alternatives,
			evidence: d.evidence, reasoning: d.reasoning, attribution: d.attribution, status: d.status
		}))), 'decisions');
		const comments = mock.fieldComments.filter((c) => c.productId === p.id);
		if (comments.length) {
			const author = id.get(mock.teams.find((t) => t.id === p.teamId)!.mentorIds[0])!;
			must(await db.from('field_comments').insert(comments.map((c) => ({ product_id: pid, field_key: c.fieldKey, author_profile_id: author, body: c.body, created_at: c.createdAt }))), 'comments');
		}
	}

	must(await db.from('tasks').insert(mock.tasks.map((t) => ({ team_id: id.get(t.teamId)!, assigned_member_id: id.get(t.assignedMemberId ?? '') ?? null, title: t.title, status: t.status, due_date: t.dueDate }))), 'tasks');

	const reviews = mock.milestoneReviews.filter((r) => r.status !== 'upcoming');
	must(await db.from('milestone_reviews').insert(reviews.map((r) => ({
		milestone_id: id.get(r.milestoneId)!, team_id: id.get(r.teamId)!, reviewer_profile_id: r.reviewerId ? id.get(r.reviewerId)! : null,
		status: r.status, feedback: r.feedback, next_steps: r.nextSteps, blockers: r.blockers, ready_at: r.readyAt, reviewed_at: r.reviewedAt
	}))), 'reviews');
	// Mentor feedback from the mock "feedback" list becomes the review's feedback text.
	for (const f of mock.feedback) {
		must(await db.from('milestone_reviews').upsert({ milestone_id: id.get(f.milestoneId)!, team_id: id.get(f.teamId)!, feedback: f.body, status: 'ready' }, { onConflict: 'milestone_id,team_id' }), 'feedback');
	}

	await writeFile('.seed-credentials.json', JSON.stringify(creds, null, 2) + '\n', { mode: 0o600 });
	console.log(`Seeded ${mock.teams.length} teams, ${mock.mentors.length} mentors, 1 admin. Logins are in .seed-credentials.json (git-ignored).`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
