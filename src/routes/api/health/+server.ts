import { json } from '@sveltejs/kit';

// Uptime check + Supabase keep-alive target (see .github/workflows/keep-alive.yml).
// Runs one tiny query so free-tier Supabase sees database activity. Returns no data.
export const GET = async ({ locals }) => {
	const { error } = await locals.supabase.from('challenges').select('id', { head: true, count: 'exact' }).limit(1);
	return json({ ok: !error, at: new Date().toISOString() }, { status: error ? 503 : 200, headers: { 'cache-control': 'no-store' } });
};
