// Verifies PRD §21 acceptance criteria 7–8 and §18 access control against the live database.
import { existsSync, readFileSync } from 'node:fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';

type Cred = { role: string; name: string; email: string; password: string };
const credsFile = '.seed-credentials.json';
const creds: Cred[] = existsSync(credsFile) ? JSON.parse(readFileSync(credsFile, 'utf8')) : [];
const url = process.env.PUBLIC_SUPABASE_URL!;
const anonKey = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secret = process.env.SUPABASE_SECRET_KEY!;

const client = () => createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
async function signIn(name: string) {
	const c = creds.find((x) => x.name === name)!;
	const sb = client();
	const { error } = await sb.auth.signInWithPassword({ email: c.email, password: c.password });
	if (error) throw error;
	return sb;
}
const productOf = async (admin: SupabaseClient, team: string) =>
	(await admin.from('teams').select('products(id)').eq('name', team).single()).data!.products as unknown as { id: string };

describe.skipIf(!creds.length)('row-level security', () => {
	let admin: SupabaseClient;
	let nestled: SupabaseClient;
	let priya: SupabaseClient;
	let nestledProduct: string;
	let onboardProduct: string;

	beforeAll(async () => {
		admin = createClient(url, secret, { auth: { persistSession: false } });
		nestled = await signIn('Nestled');
		priya = await signIn('Priya Raman');
		nestledProduct = (await productOf(admin, 'Nestled')).id;
		onboardProduct = (await productOf(admin, 'Onboard')).id;
	});

	describe('team account', () => {
		it('sees only its own team', async () => {
			const { data } = await nestled.from('teams').select('name');
			expect(data?.map((t) => t.name)).toEqual(['Nestled']);
		});

		it("cannot read another team's documentation", async () => {
			const { data } = await nestled.from('product_fields').select('id').eq('product_id', onboardProduct);
			expect(data).toEqual([]);
		});

		it('saves its own fields with version checks', async () => {
			const key = 'ov.testField';
			await admin.from('product_fields').delete().eq('product_id', nestledProduct).eq('field_key', key);
			const first = await nestled.rpc('save_field', { p_product: nestledProduct, p_key: key, p_value: 'a', p_evidence: null, p_expected_version: 0 });
			expect(first.data).toMatchObject({ ok: true, field: { version: 1 } });
			const second = await nestled.rpc('save_field', { p_product: nestledProduct, p_key: key, p_value: 'b', p_evidence: 'validated', p_expected_version: 1 });
			expect(second.data).toMatchObject({ ok: true, field: { version: 2, value: 'b' } });
			// A stale save (teammate already moved it to v2) must not overwrite.
			const stale = await nestled.rpc('save_field', { p_product: nestledProduct, p_key: key, p_value: 'stale', p_evidence: null, p_expected_version: 1 });
			expect(stale.data).toMatchObject({ ok: false, reason: 'conflict', field: { value: 'b' } });
			await admin.from('product_fields').delete().eq('product_id', nestledProduct).eq('field_key', key);
		});

		it("cannot write another team's documentation", async () => {
			const r = await nestled.rpc('save_field', { p_product: onboardProduct, p_key: 'ov.name', p_value: 'hacked', p_evidence: null, p_expected_version: 0 });
			expect(r.error).not.toBeNull();
			const ins = await nestled.from('product_fields').insert({ product_id: onboardProduct, field_key: 'ov.x', value: 'x' });
			expect(ins.error).not.toBeNull();
		});

		it('cannot record review outcomes or change its role', async () => {
			const { data: ms } = await nestled.from('milestones').select('id').limit(1).single();
			const team = (await nestled.from('teams').select('id').single()).data!;
			const upd = await nestled.from('milestone_reviews').update({ status: 'reviewed' }).eq('team_id', team.id).eq('milestone_id', ms!.id).select();
			expect(upd.data ?? []).toEqual([]);
			const prof = await nestled.from('profiles').update({ role: 'admin' }).neq('id', '00000000-0000-0000-0000-000000000000');
			expect(prof.error).not.toBeNull();
		});

		it('can mark its milestone ready', async () => {
			const { data: ms } = await nestled.from('milestones').select('id').eq('number', 2).single();
			const r = await nestled.rpc('mark_milestone_ready', { p_milestone: ms!.id });
			expect(r.error).toBeNull();
		});

		it('cannot call the admin session-revocation function', async () => {
			const me = (await nestled.auth.getUser()).data.user!;
			const r = await nestled.rpc('admin_revoke_sessions', { p_user: me.id });
			expect(r.error).not.toBeNull();
		});
	});

	describe('mentor account', () => {
		it('sees only assigned teams', async () => {
			const { data } = await priya.from('teams').select('name').order('name');
			expect(data?.map((t) => t.name)).toEqual(['Common Ground', 'Nestled', 'Paycheck Pals']);
		});

		it('can read but not edit assigned team documentation', async () => {
			const read = await priya.from('product_fields').select('field_key').eq('product_id', nestledProduct);
			expect(read.data!.length).toBeGreaterThan(0);
			const r = await priya.rpc('save_field', { p_product: nestledProduct, p_key: 'ov.name', p_value: 'mentor edit', p_evidence: null, p_expected_version: 1 });
			expect(r.error).not.toBeNull();
		});

		it('cannot read unassigned teams', async () => {
			const { data } = await priya.from('product_fields').select('id').eq('product_id', onboardProduct);
			expect(data).toEqual([]);
		});

		it('can comment on assigned teams only', async () => {
			const me = (await priya.auth.getUser()).data.user!;
			const ok = await priya.from('field_comments').insert({ product_id: nestledProduct, field_key: 'ov.name', author_profile_id: me.id, body: 'test' }).select('id').single();
			expect(ok.error).toBeNull();
			await admin.from('field_comments').delete().eq('id', ok.data!.id);
			const denied = await priya.from('field_comments').insert({ product_id: onboardProduct, field_key: 'ov.name', author_profile_id: me.id, body: 'test' });
			expect(denied.error).not.toBeNull();
		});
	});

	describe('admin account', () => {
		it('sees every team', async () => {
			const a = await signIn('Academics Committee');
			const { data } = await a.from('teams').select('id');
			expect(data!.length).toBe(creds.filter((c) => c.role === 'team').length);
		});
	});

	describe('signed-out visitor', () => {
		it('can browse published challenges only when public browsing is on', async () => {
			const { data } = await client().from('challenges').select('title');
			expect(data!.length).toBeGreaterThan(0);
		});
		it('cannot read teams or documentation', async () => {
			const anon = client();
			expect((await anon.from('teams').select('id')).data ?? []).toEqual([]);
			expect((await anon.from('product_fields').select('id')).data ?? []).toEqual([]);
		});
	});

	describe('session revocation', () => {
		it('immediately invalidates a revoked team session', async () => {
			const sb = await signIn('Wayfinders');
			const user = (await sb.auth.getUser()).data.user!;
			expect(user).toBeTruthy();
			const r = await admin.rpc('admin_revoke_sessions', { p_user: user.id });
			expect(r.error).toBeNull();
			const after = await sb.auth.getUser();
			expect(after.data.user).toBeNull();
		});
	});
});

describe.skipIf(!secret)('accounts without a Studio profile', () => {
	it('can read nothing, even if one somehow exists in Supabase Auth', async () => {
		// Simulates someone who got an Auth account outside admin provisioning (e.g. public sign-up left on).
		const admin = createClient(url, secret, { auth: { persistSession: false } });
		const email = `no-profile-${Date.now()}@studio.texasproductcatalyst.org`;
		const password = crypto.randomUUID();
		const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
		expect(error).toBeNull();
		try {
			const sb = client();
			expect((await sb.auth.signInWithPassword({ email, password })).error).toBeNull();
			for (const t of ['semesters', 'milestones', 'lessons', 'challenges', 'announcements', 'resources', 'profiles', 'teams', 'product_fields']) {
				const r = await sb.from(t).select('*').limit(1);
				expect(r.data ?? [], t).toEqual([]);
			}
		} finally {
			await admin.auth.admin.deleteUser(created.user!.id);
		}
	});
});
