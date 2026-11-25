// Privileged client (bypasses RLS). SERVER-ONLY: SvelteKit refuses to bundle $lib/server into the browser.
// Use only inside admin form actions after checking locals.role === 'admin'.
// The secret key is read at runtime ($env/dynamic) so it is never baked into build output.
import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env as pub } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';

export const supabaseAdmin = () => {
	if (!env.SUPABASE_SECRET_KEY) error(500, 'Server is missing SUPABASE_SECRET_KEY. See docs/DEPLOY.md.');
	return createClient(pub.PUBLIC_SUPABASE_URL!, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
};
