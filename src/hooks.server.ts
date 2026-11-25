import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { homeFor } from '$lib/auth/accounts';
import type { Role } from '$lib/types/domain';

// Which role may open which part of the app. Data access is ALSO enforced by RLS in the database;
// this only keeps people out of screens they can't use.
const AREAS: { prefix: string; role: Role }[] = [
	{ prefix: '/admin', role: 'admin' },
	{ prefix: '/mentor', role: 'mentor' },
	{ prefix: '/home', role: 'team' },
	{ prefix: '/product', role: 'team' },
	{ prefix: '/academy', role: 'team' },
	{ prefix: '/career', role: 'team' },
	{ prefix: '/demo-day', role: 'team' },
	{ prefix: '/settings', role: 'team' }
];

export const handle: Handle = async ({ event, resolve }) => {
	// Read at runtime: Cloudflare provides these from wrangler.toml [vars]; locally they come from .env.
	event.locals.supabase = createServerClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => cookies.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
		}
	});

	// getUser() asks Supabase Auth to validate the token, so revoked sessions are rejected immediately.
	// (getSession() alone trusts the cookie and must not be used for authorization.)
	event.locals.user = null;
	event.locals.profile = null;
	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();
	if (user) {
		const { data: profile } = await event.locals.supabase.from('profiles').select('id, display_name, role, active').eq('id', user.id).single();
		if (profile?.active) {
			event.locals.user = user;
			event.locals.profile = { id: profile.id, displayName: profile.display_name, role: profile.role };
		}
	}

	const path = event.url.pathname;
	const area = AREAS.find((a) => path === a.prefix || path.startsWith(a.prefix + '/'));
	const profile = event.locals.profile;

	if (area) {
		if (!profile) redirect(303, `/login?next=${encodeURIComponent(path)}`);
		if (profile.role !== area.role) redirect(303, homeFor(profile.role));
	}
	// Everything else (/login, /challenges, /logout, 404s) is reachable without a role check.

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
