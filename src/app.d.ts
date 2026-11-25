import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Role } from '$lib/types/domain';

declare global {
	namespace App {
		interface Locals {
			/** Per-request client acting as the signed-in user (RLS applies). */
			supabase: SupabaseClient;
			user: User | null;
			profile: { id: string; displayName: string; role: Role } | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
