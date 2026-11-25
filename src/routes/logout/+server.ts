import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals }) => {
	await locals.supabase.auth.signOut({ scope: 'local' }); // this browser only; teammates stay signed in
	redirect(303, '/login');
};
