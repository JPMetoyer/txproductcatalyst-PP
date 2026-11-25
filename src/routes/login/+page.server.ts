import { fail, redirect } from '@sveltejs/kit';
import { homeFor, loginToEmail } from '$lib/auth/accounts';
import type { Role } from '$lib/types/domain';

/** Only allow same-site relative redirects after login. */
const safeNext = (v: FormDataEntryValue | string | null) =>
	typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : null;

export const load = ({ locals, url }) => {
	if (locals.profile) redirect(303, safeNext(url.searchParams.get('next')) ?? homeFor(locals.profile.role));
	return { next: safeNext(url.searchParams.get('next')) };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const login = String(form.get('login') ?? '').trim();
		const password = String(form.get('password') ?? '');
		if (!login || !password) return fail(400, { login, error: 'Enter your team login and password.' });

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email: loginToEmail(login), password });
		if (error || !data.user) {
			// Same message for unknown user / wrong password, so logins can't be enumerated.
			return fail(400, { login, error: 'That login and password don’t match. Check with your Academics Committee contact if you’re stuck.' });
		}

		const { data: profile } = await locals.supabase.from('profiles').select('role, active').eq('id', data.user.id).single();
		if (!profile?.active) {
			await locals.supabase.auth.signOut({ scope: 'local' });
			return fail(403, { login, error: 'This account has been deactivated.' });
		}
		redirect(303, safeNext(form.get('next')) ?? homeFor(profile.role as Role));
	}
};
