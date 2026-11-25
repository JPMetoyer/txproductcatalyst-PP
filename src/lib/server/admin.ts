// Helpers shared by the admin content editors.
import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

export function requireAdmin(locals: App.Locals) {
	if (locals.profile?.role !== 'admin') error(403, 'Admins only');
}

export interface SemesterRow {
	id: string;
	name: string;
	theme: string;
	start_date: string;
	end_date: string;
	status: 'upcoming' | 'active' | 'archived';
	public_marketplace: boolean;
}

export async function listSemesters(db: SupabaseClient): Promise<SemesterRow[]> {
	const { data, error: e } = await db.from('semesters').select('id, name, theme, start_date, end_date, status, public_marketplace').order('start_date', { ascending: false });
	if (e) error(500, 'Could not load semesters');
	return data as SemesterRow[];
}

/** The semester an editor is working on: ?semester=<id>, else the active one, else the newest upcoming, else the newest. */
export async function pickSemester(db: SupabaseClient, url: URL) {
	const semesters = await listSemesters(db);
	const wanted = url.searchParams.get('semester');
	const current =
		semesters.find((s) => s.id === wanted) ??
		semesters.find((s) => s.status === 'active') ??
		semesters.find((s) => s.status === 'upcoming') ??
		semesters[0] ??
		null;
	return { semesters, current };
}

/** Textarea with one item per line → trimmed, non-empty list. */
export function lines(v: FormDataEntryValue | null, maxItems = 30, maxLen = 500): string[] {
	return String(v ?? '')
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.slice(0, maxItems)
		.map((l) => l.slice(0, maxLen));
}

export const str = (v: FormDataEntryValue | null, max = 5000) => String(v ?? '').trim().slice(0, max);
export const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
export const optDate = (v: FormDataEntryValue | null) => {
	const s = String(v ?? '').trim();
	return isDate(s) ? s : null;
};
export const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v);
