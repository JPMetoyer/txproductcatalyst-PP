// Fall 2026 demo environment. Every row it creates is tagged demo (semesters.demo, profiles.demo, resources.demo),
// and reset deletes only tagged rows, so real semesters, teams and accounts are never touched.
//
//   npm run demo:seed    → (re)creates the demo semester. Idempotent: existing demo data is replaced,
//                          demo accounts are reused and keep their passwords.
//   npm run demo:reset   → removes all demo data and demo accounts.
//
// Passwords are written to .demo-credentials.json (git-ignored) and never printed.

import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import * as shared from './demo/fall-2026-shared.ts';
import { teams, type DemoTeam, type FieldVal } from './demo/fall-2026-teams.ts';
import { slugify } from '../src/lib/auth/accounts.ts';

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');
const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const CREDS = '.demo-credentials.json';
const resetOnly = process.argv.includes('--reset');

function must<T>(r: { data: T; error: unknown }, what: string): NonNullable<T> {
	if (r.error) throw new Error(`${what}: ${JSON.stringify(r.error)}`);
	return r.data as NonNullable<T>;
}
const ids = (rows: { id: string }[]) => rows.map((r) => r.id);
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const at = (day: string, hour = 18) => `${day}T${String(hour).padStart(2, '0')}:00:00Z`;
const pad = (n: number) => String(n).padStart(2, '0');

// ───────────────────────── removal (demo rows only) ─────────────────────────

async function removeDemoData() {
	const sems = ids(must(await db.from('semesters').select('id').eq('demo', true), 'find demo semesters'));
	if (sems.length) {
		const teamIds = ids(must(await db.from('teams').select('id').in('semester_id', sems), 'find demo teams'));
		if (teamIds.length) {
			must(await db.from('products').delete().in('team_id', teamIds), 'delete products'); // cascades documentation and comments
			must(await db.from('team_members').delete().in('team_id', teamIds), 'delete rosters');
			must(await db.from('teams').delete().in('id', teamIds), 'delete teams'); // cascades tasks, reviews, flags, prep
		}
		for (const t of ['challenges', 'lessons', 'milestones', 'announcements', 'resources']) must(await db.from(t).delete().in('semester_id', sems), `delete ${t}`);
		must(await db.from('semesters').delete().in('id', sems), 'delete semesters');
	}
	must(await db.from('resources').delete().eq('demo', true), 'delete demo career items');
}

async function demoProfiles() {
	return must(await db.from('profiles').select('id, display_name').eq('demo', true), 'find demo profiles');
}

// ───────────────────────── accounts ─────────────────────────

type Cred = { role: string; name: string; login: string; password: string };
let saved: Cred[] = [];
const creds: Cred[] = [];
let allUsers: { id: string; email?: string }[] | null = null;

async function findUser(email: string) {
	if (!allUsers) {
		allUsers = [];
		for (let page = 1; ; page++) {
			const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
			if (error) throw error;
			allUsers.push(...data.users);
			if (data.users.length < 200) break;
		}
	}
	return allUsers.find((u) => u.email === email);
}

async function account(email: string, name: string, role: 'team' | 'mentor' | 'admin') {
	const existing = await findUser(email);
	let id: string;
	let password = saved.find((c) => c.login === email)?.password;
	if (existing) {
		const prof = must(await db.from('profiles').select('demo').eq('id', existing.id).maybeSingle(), 'check profile');
		if (prof && !prof.demo) throw new Error(`${email} belongs to a real account. Refusing to touch it.`);
		id = existing.id;
		if (!password) {
			password = randomBytes(18).toString('base64url');
			must(await db.auth.admin.updateUserById(id, { password }), `reset ${email}`);
		}
	} else {
		password = randomBytes(18).toString('base64url');
		id = must(await db.auth.admin.createUser({ email, password, email_confirm: true }), `create ${email}`).user.id;
	}
	must(await db.from('profiles').upsert({ id, display_name: name, role, active: true, demo: true }), `profile ${email}`);
	creds.push({ role, name, login: email, password });
	return id;
}

// ───────────────────────── generated logs ─────────────────────────

function interviewRows(t: DemoTeam) {
	const p = t.interviews;
	return Array.from({ length: p.count }, (_, i) => ({
		participant: `DEMO-${t.key.slice(0, 3).toUpperCase()}-${pad(i + 1)}`,
		category: p.categories[i % p.categories.length],
		date: addDays(p.start, Math.floor((i * 24) / p.count)),
		observations: p.observations[i % p.observations.length] + (i % 3 === 0 ? ' ' + p.observations[(i + 2) % p.observations.length] : ''),
		quotes: p.quotes[(i * 2 + 1) % p.quotes.length],
		pains: [p.pains[i % p.pains.length], p.pains[(i + 2) % p.pains.length]].join('; '),
		notes: i === 0 ? 'Pilot interview; questions refined afterward. (Demo data)' : i === p.count - 1 ? 'No new themes in the last three interviews. (Demo data)' : 'Fictional participant. (Demo data)'
	}));
}

function testingRows(t: DemoTeam) {
	const p = t.testing;
	const nBefore = Math.ceil(p.count / 2);
	return Array.from({ length: p.count }, (_, i) => {
		const before = i < nBefore;
		const j = before ? i : i - nBefore;
		return {
			participant: `DEMO-${t.key.slice(0, 3).toUpperCase()}-T${pad(i + 1)}`,
			date: before ? addDays(p.start, Math.floor((i * 4) / nBefore)) : addDays(p.changeOn, 1 + j * 2),
			task: p.tasks[i % p.tasks.length],
			observations: before ? p.before[i % p.before.length] : p.after[j % p.after.length],
			issues: before ? p.before[(i + 1) % p.before.length] : j % 2 ? 'Minor hesitation, recovered without help' : 'None observed',
			feedback: p.feedback[i % p.feedback.length],
			outcome: before ? (i % 2 ? 'Failed' : 'Completed with help') : 'Completed'
		};
	});
}

// When each section was last edited (so "recent updates" and timestamps tell a believable story).
const SECTION_DAY: Record<string, string> = { ov: '2026-11-21', di: '2026-09-29', po: '2026-10-07', mo: '2026-10-13', sc: '2026-10-19', bu: '2026-11-02', va: '2026-11-15', sh: '2026-11-23' };

// ───────────────────────── main ─────────────────────────

async function main() {
	saved = await readFile(CREDS, 'utf8').then(JSON.parse).catch(() => []);

	const realActive = must(await db.from('semesters').select('name').eq('status', 'active').eq('demo', false), 'check active');
	if (!resetOnly && realActive.length) {
		throw new Error(`A real semester ("${realActive[0].name}") is active. Only one semester can be active, so the demo was not created. Use a separate Supabase project for demos.`);
	}

	await removeDemoData();
	if (resetOnly) {
		for (const p of await demoProfiles()) must(await db.auth.admin.deleteUser(p.id), `delete ${p.display_name}`);
		await writeFile(CREDS, '[]\n', { mode: 0o600 });
		console.log('Demo data and demo accounts removed. Real data was not touched.');
		return;
	}

	const s = shared.semester;
	const sem = must(
		await db.from('semesters').insert({ name: s.name, theme: s.theme, start_date: s.startDate, end_date: s.endDate, status: 'active', public_marketplace: s.publicMarketplace, demo_day: shared.demoDay, demo: true }).select('id').single(),
		'semester'
	);

	const ch = must(
		await db.from('challenges').insert(shared.challenges.map((c, i) => ({
			semester_id: sem.id, code: c.code, title: c.title, summary: c.summary, icon: c.icon, accent: c.accent, experience: c.experience, mission: c.mission,
			stakeholders: c.stakeholders, research_considerations: c.researchConsiderations, boundaries: c.boundaries, expectations: c.expectations, published: true, position: i
		}))).select('id, code'),
		'challenges'
	);

	must(await db.from('lessons').insert(shared.lessons.map((l, i) => ({
		semester_id: sem.id, gm_number: l.gm, title: l.title, scheduled_date: l.date, description: l.description, related_phase: l.phase, published: true, position: i,
		content: { topics: l.topics, objectives: l.objectives, keyConcepts: l.keyConcepts, examples: l.examples, activity: l.activity, resources: l.resources.map((title) => ({ title, url: '' })) }
	}))), 'lessons');

	const ms = must(
		await db.from('milestones').insert(shared.milestones.map((m) => ({
			semester_id: sem.id, number: m.number, title: m.title, description: m.description, after_gm: m.afterGm, target_date: m.targetDate,
			review_areas: m.areas, review_questions: m.questions, related_phases: m.phases
		}))).select('id, number'),
		'milestones'
	);
	must(await db.from('announcements').insert(shared.announcements.map((a) => ({ semester_id: sem.id, title: a.title, body: a.body, published_at: a.at }))), 'announcements');

	const career = new Map<string, number>();
	must(await db.from('resources').insert(shared.career.map((c) => {
		const k = career.get(c.section) ?? 0;
		career.set(c.section, k + 1);
		return { category: `career:${c.section}`, title: c.title, body: c.body ?? '', position: 100 + k, demo: true };
	})), 'career');

	await account('demo-admin@example.com', 'Demo Admin', 'admin');

	for (const t of teams) {
		const mentorId = await account(`demo-mentor-${slugify(t.mentor)}@example.com`, `${t.mentor} (demo)`, 'mentor');
		const teamAcct = await account(`demo-team-${t.key}@example.com`, `Team ${t.name} (demo)`, 'team');
		const team = must(await db.from('teams').insert({
			semester_id: sem.id, name: t.name, account_profile_id: teamAcct, challenge_id: ch.find((c) => c.code === t.challenge)!.id, current_phase: t.phase, created_at: at('2026-08-31', 16)
		}).select('id').single(), `team ${t.name}`);
		must(await db.from('team_mentors').insert({ team_id: team.id, mentor_profile_id: mentorId }), 'mentor');
		const roster = must(await db.from('team_members').insert(t.members.map((name) => ({ team_id: team.id, name, created_at: at('2026-08-31', 16) }))).select('id, name'), 'roster');
		const member = (i: number) => roster.find((r) => r.name === t.members[i])!.id;
		const product = must(await db.from('products').insert({ team_id: team.id, created_at: at('2026-09-02'), updated_at: at(SECTION_DAY.sh) }).select('id').single(), 'product');
		const pid = product.id;

		// Documentation fields
		let n = 0;
		must(await db.from('product_fields').insert(Object.entries(t.fields).map(([key, v]: [string, FieldVal]) => {
			const tuple = Array.isArray(v) && v.length === 2 && (v[1] === 'validated' || v[1] === 'assumption');
			const day = SECTION_DAY[key.slice(0, 2)] ?? '2026-10-01';
			return { product_id: pid, field_key: key, value: tuple ? v[0] : v, evidence: tuple ? v[1] : null, updated_at: at(day, 14 + (n++ % 8)) };
		})), 'fields');

		// Logs
		const logs: { kind: string; data: Record<string, string>; position: number; created_at: string }[] = [];
		interviewRows(t).forEach((d, i) => logs.push({ kind: 'research', data: d, position: i, created_at: at(d.date, 20) }));
		t.competitors.forEach((d, i) => logs.push({ kind: 'competitor', data: d, position: i, created_at: at('2026-10-03', 15) }));
		t.features.forEach((d, i) => logs.push({ kind: 'feature', data: d, position: i, created_at: at('2026-10-16', 15) }));
		testingRows(t).forEach((d, i) => logs.push({ kind: 'testing', data: d, position: i, created_at: at(d.date, 21) }));
		t.iterations.forEach((d, i) => logs.push({ kind: 'iteration', data: d, position: i, created_at: at(d.date, 22) }));
		must(await db.from('log_entries').insert(logs.map((l) => ({ product_id: pid, ...l, updated_at: l.created_at }))), 'logs');

		must(await db.from('product_decisions').insert(t.decisions.map((d) => ({
			product_id: pid, title: d.title, decided_on: d.date, phase: d.phase, description: d.description, alternatives: d.alternatives,
			evidence: d.evidence, reasoning: d.reasoning, attribution: d.by, status: d.status, created_at: at(d.date), updated_at: at(d.date)
		}))), 'decisions');

		must(await db.from('feasibility_assessments').insert(Object.entries(t.feasibility).map(([area, [status, notes]]) => ({
			product_id: pid, area, status, notes, evidence: '', updated_at: at('2026-10-20')
		}))), 'feasibility');
		must(await db.from('business_model_scenarios').insert({ product_id: pid, model_type: 'studio', assumptions: t.businessModel, updated_at: at('2026-10-12') }), 'business model');

		// Comment threads. A reply starting "Reopening" after the resolve time leaves the thread open again.
		for (const c of t.comments) {
			const reopened = !!c.resolved && (c.replies ?? []).some((r) => r.at > c.resolved! && r.body.startsWith('Reopening'));
			const root = must(await db.from('field_comments').insert({
				product_id: pid, field_key: c.field, author_profile_id: mentorId, body: c.body, created_at: c.at,
				resolved: !!c.resolved && !reopened, resolved_by: c.resolved && !reopened ? teamAcct : null, resolved_at: c.resolved && !reopened ? c.resolved : null
			}).select('id').single(), 'comment');
			if (c.replies?.length) {
				must(await db.from('field_comments').insert(c.replies.map((r) => ({
					product_id: pid, field_key: c.field, parent_id: root.id, author_profile_id: r.by === 'team' ? teamAcct : mentorId, body: r.body, created_at: r.at
				}))), 'replies');
			}
		}

		must(await db.from('tasks').insert(t.tasks.map((k) => ({
			team_id: team.id, assigned_member_id: member(k.member), title: k.title, status: k.done ? 'done' : 'open', due_date: k.due, created_at: at(k.created, 17)
		}))), 'tasks');

		must(await db.from('milestone_reviews').insert(t.reviews.map((r, i) => {
			const m = shared.milestones[i];
			const reviewed = at(addDays(m.targetDate, 1), 18);
			return {
				milestone_id: ms.find((x) => x.number === m.number)!.id, team_id: team.id, reviewer_profile_id: mentorId,
				status: r.followUp ? 'follow-up' : 'reviewed', feedback: r.feedback, next_steps: r.next, blockers: r.blockers ?? '',
				ready_at: at(addDays(m.targetDate, -1), 20), reviewed_at: reviewed, updated_at: reviewed
			};
		})), 'reviews');

		if (t.flag) must(await db.from('team_flags').insert({ team_id: team.id, reason: t.flag.reason, flagged_by: mentorId, created_at: t.flag.at }), 'flag');
		must(await db.from('team_demo_day').insert({ team_id: team.id, readiness: t.readiness, checked: shared.demoDay.checklist.slice(0, t.checklistDone), updated_at: at('2026-11-23', 22) }), 'demo day prep');
	}

	await writeFile(CREDS, JSON.stringify(creds, null, 2) + '\n', { mode: 0o600 });
	console.log(`Fall 2026 demo ready: ${teams.length} teams, ${teams.length} mentors, 1 admin. Logins are in ${CREDS} (git-ignored).`);
}

main().catch((e) => {
	console.error(e instanceof Error ? e.message : e);
	process.exit(1);
});
