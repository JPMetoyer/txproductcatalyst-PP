import { redirect } from '@sveltejs/kit';
import { homeFor } from '$lib/auth/accounts';

export const load = ({ locals }) => redirect(303, locals.profile ? homeFor(locals.profile.role) : '/login');
