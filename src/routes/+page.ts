import { redirect } from '@sveltejs/kit';

// Phase 1: redirect based on the authenticated user's role.
export const load = () => redirect(307, '/login');
