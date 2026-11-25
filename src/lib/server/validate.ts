// Input validation for write endpoints. The database enforces access (RLS) and basic
// constraints; this keeps junk out (unknown field keys, oversized text, wrong shapes).

import { error } from '@sveltejs/kit';
import { PRODUCT_SCHEMA, type FieldDef, type TableDef } from '$lib/config/product-schema';
import { JOURNEY } from '$lib/config/phases';
import type { DecisionStatus, JourneyPhase, LogKind } from '$lib/types/domain';

export const MAX_TEXT = 20_000;
export const MAX_SHORT = 300;

const FIELDS = new Map<string, FieldDef>(PRODUCT_SCHEMA.flatMap((s) => s.groups.flatMap((g) => g.fields)).map((f) => [f.key, f]));
const TABLES = new Map<LogKind, TableDef>(PRODUCT_SCHEMA.flatMap((s) => s.tables ?? []).map((t) => [t.kind, t]));

export const bad = (msg: string): never => error(400, msg);

export const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const uuid = (v: unknown, name = 'id') => (isUuid(v) ? v : bad(`Invalid ${name}`));

export function text(v: unknown, name: string, max = MAX_TEXT): string {
	if (v == null) return '';
	if (typeof v !== 'string') bad(`${name} must be text`);
	if ((v as string).length > max) bad(`${name} is too long (max ${max} characters)`);
	return v as string;
}

export const int = (v: unknown, name: string) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : bad(`Invalid ${name}`));

/** Validates a documentation field value against its definition in product-schema.ts. */
export function fieldValue(key: unknown, value: unknown): { key: string; value: unknown } {
	const def = typeof key === 'string' ? FIELDS.get(key) : undefined;
	if (!def) bad('Unknown field');
	if (def!.type === 'multiselect') {
		if (!Array.isArray(value) || value.some((x) => typeof x !== 'string' || !def!.options?.includes(x))) bad('Invalid selection');
		return { key: def!.key, value: [...new Set(value as string[])] };
	}
	if (def!.type === 'select') {
		const v = text(value, def!.label, MAX_SHORT);
		if (v && !def!.options?.includes(v)) bad('Invalid option');
		return { key: def!.key, value: v };
	}
	const v = text(value, def!.label, def!.type === 'text' || def!.type === 'url' ? 2_000 : MAX_TEXT);
	if (def!.type === 'url' && v && !/^https?:\/\/\S+$/i.test(v.trim())) bad('Links must start with http:// or https://');
	return { key: def!.key, value: v };
}

export const evidence = (v: unknown) => (v == null ? null : v === 'assumption' || v === 'validated' ? v : bad('Invalid evidence'));

export function logKind(v: unknown): LogKind {
	return TABLES.has(v as LogKind) ? (v as LogKind) : bad('Invalid log type');
}

/** Keeps only known columns, as strings, within size limits. */
export function logData(kind: LogKind, v: unknown): Record<string, string> {
	if (typeof v !== 'object' || v === null || Array.isArray(v)) bad('Invalid entry');
	const out: Record<string, string> = {};
	for (const col of TABLES.get(kind)!.columns) {
		const raw = (v as Record<string, unknown>)[col.key];
		if (raw == null || raw === '') continue;
		const s = text(raw, col.label, col.type === 'textarea' ? 10_000 : 1_000);
		if (col.type === 'select' && s && !col.options?.includes(s)) bad(`Invalid ${col.label}`);
		if (col.type === 'date' && s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) bad(`Invalid ${col.label}`);
		out[col.key] = s;
	}
	return out;
}

export const phase = (v: unknown): JourneyPhase => (JOURNEY.includes(v as JourneyPhase) ? (v as JourneyPhase) : bad('Invalid phase'));
export const decisionStatus = (v: unknown): DecisionStatus =>
	['proposed', 'accepted', 'reconsidering', 'reversed'].includes(v as string) ? (v as DecisionStatus) : bad('Invalid status');
export const date = (v: unknown, name: string) => (v == null || v === '' ? null : typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : bad(`Invalid ${name}`));

/** Reads a JSON body and requires a signed-in team-or-admin user. */
export async function body(request: Request, locals: App.Locals): Promise<Record<string, unknown>> {
	if (!locals.profile) error(401, 'Sign in again');
	try {
		const b = await request.json();
		if (typeof b !== 'object' || b === null) throw 0;
		return b;
	} catch {
		return bad('Invalid request');
	}
}

/** Maps Postgres permission errors to 403 so the UI can say "not allowed" instead of "server error". */
export function dbFail(e: { code?: string; message: string } | null, what: string): never {
	if (e?.code === '42501') error(403, `You don't have permission to change this ${what}.`);
	error(500, `Could not save ${what}.`);
}
