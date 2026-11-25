import { error, fail } from '@sveltejs/kit';
import { ACCOUNT_DOMAIN, emailToLogin, slugify } from '$lib/auth/accounts';
import { supabaseAdmin } from '$lib/server/supabase-admin';

/**
 * Strong, readable shared password: 4 groups of 5 from an unambiguous alphabet (≈ 113 bits).
 * Uses Web Crypto so it runs on Cloudflare without Node APIs.
 */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generatePassword = () => {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
	return chars.match(/.{5}/g)!.join('-');
};

export const load = async ({ locals }) => {
	const db = locals.supabase; // admin's own session; RLS lets admins read everything
	const [teams, challenges, mentors] = await Promise.all([
		db
			.from('teams')
			.select('id, name, status, challenge_id, account_profile_id, team_mentors(mentor_profile_id), team_members(id, name, active)')
			.order('name'),
		db.from('challenges').select('id, title').order('position'),
		db.from('profiles').select('id, display_name').eq('role', 'mentor').eq('active', true).order('display_name')
	]);
	if (teams.error) error(500, teams.error.message);

	// Account logins come from Auth (not readable through RLS), so fetch them with the admin client.
	const admin = supabaseAdmin();
	const logins = new Map<string, string>();
	for (const t of teams.data) {
		if (!t.account_profile_id) continue;
		const { data } = await admin.auth.admin.getUserById(t.account_profile_id);
		if (data.user?.email) logins.set(t.id, emailToLogin(data.user.email));
	}

	return {
		teams: teams.data.map((t) => ({
			id: t.id,
			name: t.name,
			status: t.status,
			challengeId: t.challenge_id,
			mentorId: t.team_mentors[0]?.mentor_profile_id ?? null,
			login: logins.get(t.id) ?? null,
			roster: t.team_members.filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }))
		})),
		challenges: challenges.data ?? [],
		mentors: (mentors.data ?? []).map((m) => ({ id: m.id, name: m.display_name }))
	};
};

function requireAdmin(locals: App.Locals) {
	if (locals.profile?.role !== 'admin') error(403, 'Admins only');
}

async function teamAccount(locals: App.Locals, teamId: string) {
	const { data } = await locals.supabase.from('teams').select('id, name, account_profile_id').eq('id', teamId).single();
	if (!data?.account_profile_id) error(404, 'Team account not found');
	return data as { id: string; name: string; account_profile_id: string };
}

export const actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const challengeId = String(form.get('challengeId') ?? '') || null;
		const mentorId = String(form.get('mentorId') ?? '') || null;
		if (name.length < 2 || name.length > 80) return fail(400, { action: 'create', error: 'Team name must be 2–80 characters.' });

		const { data: semester } = await locals.supabase.from('semesters').select('id').eq('status', 'active').maybeSingle();
		if (!semester) return fail(400, { action: 'create', error: 'Create an active semester first.' });

		const login = `team-${slugify(name)}`;
		const password = generatePassword();
		const admin = supabaseAdmin();

		const { data: created, error: authErr } = await admin.auth.admin.createUser({
			email: `${login}@${ACCOUNT_DOMAIN}`,
			password,
			email_confirm: true
		});
		if (authErr || !created.user) {
			const taken = authErr?.message.toLowerCase().includes('already');
			return fail(400, { action: 'create', error: taken ? `The login “${login}” is already taken. Pick a different team name.` : 'Could not create the account.' });
		}
		const uid = created.user.id;

		// If any step fails, remove the half-created account so the admin can simply retry.
		const rollback = async (msg: string) => {
			await admin.from('teams').delete().eq('account_profile_id', uid);
			await admin.auth.admin.deleteUser(uid);
			return fail(500, { action: 'create', error: msg });
		};
		const p = await admin.from('profiles').insert({ id: uid, display_name: `Team ${name}`, role: 'team' });
		if (p.error) return rollback('Could not create the team profile.');
		const t = await admin
			.from('teams')
			.insert({ semester_id: semester.id, name, account_profile_id: uid, challenge_id: challengeId })
			.select('id')
			.single();
		if (t.error) return rollback(t.error.code === '23505' ? 'A team with that name already exists this semester.' : 'Could not create the team.');
		const pr = await admin.from('products').insert({ team_id: t.data.id });
		if (pr.error) return rollback('Could not create the product workspace.');
		if (mentorId) await admin.from('team_mentors').insert({ team_id: t.data.id, mentor_profile_id: mentorId });

		return { action: 'create', credentials: { team: name, login, password } };
	},

	resetCredentials: async ({ request, locals }) => {
		requireAdmin(locals);
		const team = await teamAccount(locals, String((await request.formData()).get('teamId')));
		const admin = supabaseAdmin();
		const password = generatePassword();
		const { data, error: e } = await admin.auth.admin.updateUserById(team.account_profile_id, { password });
		if (e) return fail(500, { action: 'reset', error: 'Could not reset the password.' });
		await admin.rpc('admin_revoke_sessions', { p_user: team.account_profile_id });
		return { action: 'reset', credentials: { team: team.name, login: emailToLogin(data.user.email ?? ''), password } };
	},

	revokeSessions: async ({ request, locals }) => {
		requireAdmin(locals);
		const team = await teamAccount(locals, String((await request.formData()).get('teamId')));
		const { error: e } = await supabaseAdmin().rpc('admin_revoke_sessions', { p_user: team.account_profile_id });
		if (e) return fail(500, { action: 'revoke', error: 'Could not sign out sessions.' });
		return { action: 'revoke', message: `Signed out every device using ${team.name}'s account.` };
	},

	assign: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const teamId = String(form.get('teamId'));
		const db = locals.supabase;
		if (form.has('challengeId')) {
			const { error: e } = await db.from('teams').update({ challenge_id: String(form.get('challengeId')) || null }).eq('id', teamId);
			if (e) return fail(500, { action: 'assign', error: 'Could not update the challenge.' });
			return { action: 'assign', message: 'Challenge updated.' };
		}
		if (form.has('mentorId')) {
			const mentorId = String(form.get('mentorId'));
			await db.from('team_mentors').delete().eq('team_id', teamId);
			if (mentorId) {
				const { error: e } = await db.from('team_mentors').insert({ team_id: teamId, mentor_profile_id: mentorId });
				if (e) return fail(500, { action: 'assign', error: 'Could not update the mentor.' });
			}
			return { action: 'assign', message: 'Mentor updated.' };
		}
		return fail(400, { action: 'assign', error: 'Nothing to update.' });
	}
};
