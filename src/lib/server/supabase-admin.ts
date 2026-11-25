// Privileged client (bypasses RLS). SERVER-ONLY: SvelteKit refuses to bundle $lib/server into the browser.
// Use only inside admin form actions after checking locals.role === 'admin'.
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';

export const supabaseAdmin = () =>
	createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
