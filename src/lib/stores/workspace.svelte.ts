// Client-side state for the My Product workspace with autosave.
//
// Fields: each field saves on its own (debounced) through /api/product/fields, which calls the
// versioned `save_field` RPC. If a teammate saved first, the field enters a 'conflict' state and
// the user picks "Keep mine" or "Use theirs" — nothing is ever silently overwritten.
// Logs and decisions: one row at a time, also version-checked.

import { toast } from '$lib/stores/toast.svelte';
import type { Decision, FieldComment, FieldEvidence, LogEntry, LogKind, Product, ProductFieldValue, SaveState } from '$lib/types/domain';

const FIELD_DEBOUNCE = 800;
const ROW_DEBOUNCE = 900;

export interface FieldStatus {
	state: SaveState;
	/** The newer value a teammate saved, when state === 'conflict'. */
	theirs?: unknown;
	theirVersion?: number;
}

async function api<T>(url: string, method: string, payload: unknown): Promise<T> {
	const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
	if (!res.ok) {
		const msg = await res.json().then((b) => b.message as string).catch(() => res.statusText);
		throw Object.assign(new Error(msg || 'Request failed'), { status: res.status });
	}
	return res.json();
}

class Workspace {
	product = $state<Product | null>(null);
	comments = $state<FieldComment[]>([]);
	/** Per-field status; `__rows` tracks log/decision saves. */
	status = $state<Record<string, FieldStatus>>({});
	lastSavedAt = $state<string | null>(null);
	readonly = $state(false);
	/** Viewer may start new comment threads (mentors/admins). Teams can only reply. */
	canStartThreads = $state(false);
	/** Viewer may reply to / resolve threads. */
	canComment = $state(false);

	private timers = new Map<string, ReturnType<typeof setTimeout>>();
	private inflight = 0;

	/** Load server data. Re-initializes only when switching products so unsaved local edits survive navigation. */
	init(
		product: Product | null,
		comments: FieldComment[] = [],
		opts: { readonly?: boolean; force?: boolean; canStartThreads?: boolean; canComment?: boolean } = {}
	) {
		if (!opts.force && product && this.product?.id === product.id && this.readonly === !!opts.readonly) return;
		for (const t of this.timers.values()) clearTimeout(t);
		this.timers.clear();
		this.product = product ? structuredClone(product) : null;
		this.comments = comments;
		this.status = {};
		this.lastSavedAt = null;
		this.readonly = !!opts.readonly;
		this.canStartThreads = !!opts.canStartThreads;
		this.canComment = opts.canComment ?? !opts.readonly;
	}

	get overall(): SaveState {
		const states = Object.values(this.status).map((s) => s.state);
		if (states.includes('conflict')) return 'conflict';
		if (states.includes('error')) return 'error';
		if (states.includes('saving')) return 'saving';
		return this.lastSavedAt ? 'saved' : 'idle';
	}

	/** True while anything is unsaved (used to warn before closing the tab). */
	get dirty() {
		return this.inflight > 0 || this.timers.size > 0;
	}

	value(key: string): unknown {
		return this.product?.fields[key]?.value ?? null;
	}
	evidence(key: string): FieldEvidence {
		return this.product?.fields[key]?.evidence ?? null;
	}

	/* ---------------- fields ---------------- */

	set(key: string, value: unknown, evidence?: FieldEvidence) {
		if (!this.product || this.readonly) return;
		const prev = this.product.fields[key];
		this.product.fields[key] = {
			value,
			evidence: evidence === undefined ? (prev?.evidence ?? null) : evidence,
			version: prev?.version ?? 0,
			updatedAt: prev?.updatedAt ?? new Date().toISOString()
		};
		if (this.status[key]?.state === 'conflict') return; // wait for the user to resolve
		this.status[key] = { state: 'saving' };
		this.schedule(key, () => this.persistField(key), FIELD_DEBOUNCE);
	}

	private schedule(id: string, fn: () => void, ms: number) {
		clearTimeout(this.timers.get(id));
		this.timers.set(
			id,
			setTimeout(() => {
				this.timers.delete(id);
				fn();
			}, ms)
		);
	}

	/** Keys with a save request in flight; a second save waits so it never sends a stale version. */
	private busy = new Set<string>();

	private async persistField(key: string) {
		if (this.busy.has(key)) {
			this.schedule(key, () => this.persistField(key), 250);
			return;
		}
		const local = this.product!.fields[key];
		const sent = local.value;
		this.busy.add(key);
		this.inflight++;
		try {
			const r = await api<{ ok: boolean; field: ProductFieldValue }>('/api/product/fields', 'POST', {
				productId: this.product!.id,
				key,
				value: local.value,
				evidence: local.evidence,
				expectedVersion: local.version
			});
			const cur = this.product!.fields[key];
			if (r.ok) {
				cur.version = r.field.version;
				cur.updatedAt = r.field.updatedAt;
				this.lastSavedAt = r.field.updatedAt;
				// If they kept typing while this request was in flight, save again with the new version.
				if (cur.value !== sent && !this.timers.has(key)) this.schedule(key, () => this.persistField(key), 0);
				else if (!this.timers.has(key)) this.status[key] = { state: 'saved' };
			} else {
				this.status[key] = { state: 'conflict', theirs: r.field.value, theirVersion: r.field.version };
			}
		} catch (e) {
			this.status[key] = { state: 'error' };
			if ((e as { status?: number }).status === 401) toast('Your session ended. Copy any unsaved text, then sign in again.', 'error', 8000);
			else toast((e as Error).message, 'error', 6000);
		} finally {
			this.busy.delete(key);
			this.inflight--;
		}
	}

	/** Conflict resolution: explicitly overwrite the teammate's version with mine. */
	keepMine(key: string) {
		const s = this.status[key];
		if (!s || s.theirVersion == null) return;
		this.product!.fields[key].version = s.theirVersion;
		this.status[key] = { state: 'saving' };
		this.persistField(key);
	}

	/** Conflict resolution: discard my edit and take the teammate's version. */
	takeTheirs(key: string) {
		const s = this.status[key];
		if (!s || s.theirVersion == null) return;
		const f = this.product!.fields[key];
		f.value = s.theirs;
		f.version = s.theirVersion;
		this.status[key] = { state: 'saved' };
	}

	retry(key: string) {
		this.status[key] = { state: 'saving' };
		this.persistField(key);
	}

	/* ---------------- logs ---------------- */

	logs(kind: LogKind): LogEntry[] {
		return (this.product?.logs ?? []).filter((l) => l.kind === kind).sort((a, b) => a.position - b.position);
	}

	private rows(state: SaveState) {
		this.status.__rows = { state };
		if (state === 'saved') this.lastSavedAt = new Date().toISOString();
	}

	async addLog(kind: LogKind): Promise<LogEntry | null> {
		if (!this.product || this.readonly) return null;
		this.rows('saving');
		try {
			const entry = await api<LogEntry>('/api/product/logs', 'POST', { productId: this.product.id, kind, position: this.logs(kind).length });
			this.product.logs.push(entry);
			this.rows('saved');
			return entry;
		} catch (e) {
			this.rows('error');
			toast((e as Error).message, 'error');
			return null;
		}
	}

	updateLog(id: string, col: string, value: string) {
		const e = this.product?.logs.find((l) => l.id === id);
		if (!e || this.readonly) return;
		e.data[col] = value;
		this.rows('saving');
		this.schedule(`log:${id}`, () => this.persistLog(id), ROW_DEBOUNCE);
	}

	private async persistLog(id: string) {
		const e = this.product!.logs.find((l) => l.id === id);
		if (!e) return;
		const k = `log:${id}`;
		if (this.busy.has(k)) {
			this.schedule(k, () => this.persistLog(id), 250);
			return;
		}
		const sent = JSON.stringify(e.data);
		this.busy.add(k);
		this.inflight++;
		try {
			const r = await api<{ ok: boolean; entry: LogEntry }>('/api/product/logs', 'PATCH', { id, kind: e.kind, data: e.data, expectedVersion: e.version });
			const cur = this.product!.logs.find((l) => l.id === id);
			if (!cur) return;
			if (r.ok) {
				cur.version = r.entry.version;
				if (JSON.stringify(cur.data) !== sent && !this.timers.has(`log:${id}`)) this.schedule(`log:${id}`, () => this.persistLog(id), 0);
				else this.rows('saved');
			} else {
				// Rows are small; take the teammate's version and tell the user what happened.
				Object.assign(cur, r.entry);
				this.rows('saved');
				toast('A teammate edited this entry at the same time — showing their latest version. Re-apply your change if needed.', 'info', 8000);
			}
		} catch (err) {
			this.rows('error');
			toast((err as Error).message, 'error');
		} finally {
			this.busy.delete(k);
			this.inflight--;
		}
	}

	async removeLog(id: string) {
		if (!this.product || this.readonly) return;
		clearTimeout(this.timers.get(`log:${id}`));
		this.timers.delete(`log:${id}`);
		const i = this.product.logs.findIndex((l) => l.id === id);
		const [removed] = this.product.logs.splice(i, 1);
		try {
			await api('/api/product/logs', 'DELETE', { id });
			this.rows('saved');
		} catch (e) {
			this.product.logs.splice(i, 0, removed); // restore
			toast((e as Error).message, 'error');
		}
	}

	/* ---------------- comment threads ---------------- */

	/** Threads for a field: roots (oldest first) with their replies. */
	threads(fieldKey: string) {
		const all = this.comments.filter((c) => c.fieldKey === fieldKey);
		return all
			.filter((c) => !c.parentId)
			.map((root) => ({ root, replies: all.filter((r) => r.parentId === root.id) }));
	}

	async addComment(fieldKey: string, body: string, parentId: string | null = null): Promise<boolean> {
		if (!this.product) return false;
		try {
			const c = await api<FieldComment>('/api/comments', 'POST', { productId: this.product.id, fieldKey, body, parentId });
			this.comments.push(c);
			return true;
		} catch (e) {
			toast((e as Error).message, 'error');
			return false;
		}
	}

	async setResolved(id: string, resolved: boolean) {
		try {
			const c = await api<FieldComment>('/api/comments', 'PATCH', { id, resolved });
			const i = this.comments.findIndex((x) => x.id === id);
			if (i >= 0) this.comments[i] = c;
			toast(resolved ? 'Thread resolved' : 'Thread reopened', 'success');
		} catch (e) {
			toast((e as Error).message, 'error');
		}
	}

	/* ---------------- decisions ---------------- */

	async saveDecision(d: Decision): Promise<boolean> {
		if (!this.product || this.readonly) return false;
		const list = this.product.decisions;
		const isNew = d.version == null;
		this.rows('saving');
		try {
			const r = await api<{ ok: boolean; decision: Decision }>(
				'/api/product/decisions',
				isNew ? 'POST' : 'PATCH',
				isNew ? { ...d, productId: this.product.id } : d
			);
			const i = list.findIndex((x) => x.id === (isNew ? d.id : r.decision.id));
			if (i >= 0) list[i] = r.decision;
			else list.unshift(r.decision);
			this.rows('saved');
			if (!r.ok) {
				toast('A teammate changed this decision first — showing their version. Your edit was not saved.', 'info', 8000);
				return false;
			}
			return true;
		} catch (e) {
			this.rows('error');
			toast((e as Error).message, 'error');
			return false;
		}
	}

	async removeDecision(id: string) {
		if (!this.product || this.readonly) return;
		const list = this.product.decisions;
		const i = list.findIndex((x) => x.id === id);
		const [removed] = list.splice(i, 1);
		try {
			await api('/api/product/decisions', 'DELETE', { id });
			this.rows('saved');
		} catch (e) {
			list.splice(i, 0, removed);
			toast((e as Error).message, 'error');
		}
	}
}

export const workspace = new Workspace();
