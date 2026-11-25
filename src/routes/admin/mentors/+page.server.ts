import { error, fail } from '@sveltejs/kit';
import { ACCOUNT_DOMAIN, emailToLogin, slugify } from '$lib/auth/accounts';
import { generatePassword } from '$lib/server/passwords';
import { supabaseAdmin } from '$lib/server/supabase-admin';
import { activeSemester } from '$lib/server/teams';
import { isUuid } from '$lib/server/validate';

export const load = async ({ locals }) => {
	const db = locals.supabase;
	const sem = await activeSemester(db);
	const [mentors, teams, reviews] = await Promise.all([
		db.from('profiles').select('id, display_name, active, created_at').eq('role', 'mentor').order('display_name'),
		sem ? db.from('teams').select('id, name, team_mentors(mentor_profile_id)').eq('semester_id', sem.id).order('name') : { data: [] },
		db.from('milestone_reviews').select('reviewer_profile_id, reviewed_at').not('reviewed_at', 'is', null)
	]);
	if (mentors.error) error(500, 'Could not load mentors');

	const admin = supabaseAdmin();
	const logins = new Map<string, string>();
	await Promise.all(
		mentors.data.map(async (m) => {
			const { data } = await admin.auth.admin.getUserById(m.id);
			if (data.user?.email) logins.set(m.id, emailToLogin(data.user.email));
		})
	);

	const teamList = (teams.data ?? []) as { id: string; name: string; team_mentors: { mentor_profile_id: string }[] }[];
	return {
		teams: teamList.map((t) => ({ id: t.id, name: t.name })),
		mentors: mentors.data.map((m) => {
			const mine = (reviews.data ?? []).filter((r) => r.reviewer_profile_id === m.id);
			return {
				id: m.id,
				name: m.display_name,
				active: m.active,
				login: logins.get(m.id) ?? null,
				teamIds: teamList.filter((t) => t.team_mentors.some((x) => x.mentor_profile_id === m.id)).map((t) => t.id),
				reviewCount: mine.length,
				lastReviewAt: mine.map((r) => r.reviewed_at as string).sort().at(-1) ?? null
			};
		})
	};
};

const requireAdmin = (locals: App.Locals) => {
	if (locals.profile?.role !== 'admin') error(403, 'Admins only');
};
const mentorId = (v: FormDataEntryValue | null) => (isUuid(v) ? (v as string) : error(400, 'Invalid mentor'));

export const actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const name = String((await request.formData()).get('name') ?? '').trim();
		if (name.length < 2 || name.length > 80) return fail(400, { error: 'Name must be 2–80 characters.' });
		const login = `mentor-${slugify(name)}`;
		const password = generatePassword();
		const admin = supabaseAdmin();
		const { data, error: e } = await admin.auth.admin.createUser({ email: `${login}@${ACCOUNT_DOMAIN}`, password, email_confirm: true });
		if (e || !data.user) return fail(400, { error: e?.message.toLowerCase().includes('already') ? `The login “${login}” is taken.` : 'Could not create the account.' });
		const p = await admin.from('profiles').insert({ id: data.user.id, display_name: name, role: 'mentor' });
		if (p.error) {
			await admin.auth.admin.deleteUser(data.user.id);
			return fail(500, { error: 'Could not create the mentor profile.' });
		}
		return { credentials: { team: name, login, password }, ok: `Created ${name}.` };
	},

	reset: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = mentorId((await request.formData()).get('id'));
		const admin = supabaseAdmin();
		const password = generatePassword();
		const { data, error: e } = await admin.auth.admin.updateUserById(id, { password });
		if (e) return fail(500, { error: 'Could not reset the password.' });
		await admin.rpc('admin_revoke_sessions', { p_user: id });
		const { data: prof } = await admin.from('profiles').select('display_name').eq('id', id).single();
		return { credentials: { team: prof?.display_name ?? 'Mentor', login: emailToLogin(data.user.email ?? ''), password } };
	},

	setActive: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = mentorId(f.get('id'));
		const active = f.get('active') === 'true';
		const admin = supabaseAdmin();
		const { error: e } = await admin.from('profiles').update({ active }).eq('id', id).eq('role', 'mentor');
		if (e) return fail(500, { error: 'Could not update the mentor.' });
		if (!active) await admin.rpc('admin_revoke_sessions', { p_user: id }); // sign them out everywhere
		return { ok: active ? 'Mentor reactivated.' : 'Mentor deactivated and signed out. Their past reviews are kept.' };
	},

	assign: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = mentorId(f.get('id'));
		const teamIds = f.getAll('teamIds').map(String).filter(isUuid);
		const all = f.getAll('allTeamIds').map(String).filter(isUuid);
		const db = locals.supabase;
		// Only touch teams that were shown on the form (the active semester).
		const del = await db.from('team_mentors').delete().eq('mentor_profile_id', id).in('team_id', all);
		const ins = teamIds.length ? await db.from('team_mentors').insert(teamIds.map((t) => ({ team_id: t, mentor_profile_id: id }))) : { error: null };
		if (del.error || ins.error) return fail(500, { error: 'Could not update assignments.' });
		return { ok: 'Assignments updated.' };
	}
};
