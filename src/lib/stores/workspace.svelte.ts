// Client-side state for the My Product workspace with simulated autosave.
// In Phase 2, `persist()` calls the `save_field` RPC instead of the in-memory `server` copy.

import { applySave } from '$lib/data/field-store';
import { getProduct } from '$lib/data';
import type { Decision, FieldEvidence, LogEntry, LogKind, Product, ProductFields, SaveState } from '$lib/types/domain';

const LATENCY = 450;

function clone<T>(v: T): T {
	return JSON.parse(JSON.stringify(v));
}

export interface FieldStatus {
	state: SaveState;
	/** The newer value a teammate saved, when state === 'conflict'. */
	theirs?: unknown;
}

class Workspace {
	product = $state<Product | null>(null);
	status = $state<Record<string, FieldStatus>>({});
	/** Aggregate indicator for the header. */
	lastSavedAt = $state<string | null>(null);

	/** Stand-in for the database. Kept separate from `product` so conflicts can be simulated. */
	private server: ProductFields = {};
	private timers = new Map<string, ReturnType<typeof setTimeout>>();

	load(teamId: string) {
		if (this.product?.teamId === teamId) return;
		const p = getProduct(teamId);
		this.status = {};
		if (!p) {
			this.product = null;
			this.server = {};
			return;
		}
		this.product = clone(p);
		this.server = clone(p.fields);
	}

	get overall(): SaveState {
		const states = Object.values(this.status).map((s) => s.state);
		if (states.includes('conflict')) return 'conflict';
		if (states.includes('error')) return 'error';
		if (states.includes('saving')) return 'saving';
		return this.lastSavedAt ? 'saved' : 'idle';
	}

	value(key: string): unknown {
		return this.product?.fields[key]?.value ?? null;
	}
	evidence(key: string): FieldEvidence {
		return this.product?.fields[key]?.evidence ?? null;
	}

	/** Update locally and schedule a debounced save. */
	set(key: string, value: unknown, evidence?: FieldEvidence) {
		if (!this.product) return;
		const prev = this.product.fields[key];
		this.product.fields[key] = {
			value,
			evidence: evidence === undefined ? (prev?.evidence ?? null) : evidence,
			version: prev?.version ?? 0,
			updatedAt: prev?.updatedAt ?? new Date().toISOString()
		};
		if (this.status[key]?.state === 'conflict') return; // wait for the user to resolve
		this.status[key] = { state: 'saving' };
		clearTimeout(this.timers.get(key));
		this.timers.set(
			key,
			setTimeout(() => this.persist(key), 700)
		);
	}

	private async persist(key: string) {
		const local = this.product!.fields[key];
		await new Promise((r) => setTimeout(r, LATENCY));
		const result = applySave(this.server, key, { value: local.value, evidence: local.evidence }, local.version);
		if (result.ok) {
			// Only adopt the new version; keep any keystrokes typed while the request was in flight.
			this.product!.fields[key].version = result.field.version;
			this.status[key] = { state: 'saved' };
			this.lastSavedAt = result.field.updatedAt;
		} else if (result.reason === 'conflict') {
			this.status[key] = { state: 'conflict', theirs: result.current.value };
		} else {
			this.status[key] = { state: 'error' };
		}
	}

	/** Conflict resolution: overwrite theirs with mine (explicit, never silent). */
	keepMine(key: string) {
		const theirs = this.server[key];
		this.product!.fields[key].version = theirs.version;
		this.status[key] = { state: 'saving' };
		this.persist(key);
	}

	/** Conflict resolution: discard my edit, take the teammate's version. */
	takeTheirs(key: string) {
		this.product!.fields[key] = clone(this.server[key]);
		this.status[key] = { state: 'saved' };
	}

	retry(key: string) {
		this.status[key] = { state: 'saving' };
		this.persist(key);
	}

	/** Prototype helper: pretend a teammate on another laptop saved this field. */
	simulateTeammateEdit(key: string, value: string) {
		const cur = this.server[key];
		this.server[key] = {
			value,
			evidence: cur?.evidence ?? null,
			version: (cur?.version ?? 0) + 1,
			updatedAt: new Date().toISOString()
		};
	}

	/* ---------- repeatable logs ---------- */
	logs(kind: LogKind): LogEntry[] {
		return (this.product?.logs ?? []).filter((l) => l.kind === kind).sort((a, b) => a.position - b.position);
	}
	addLog(kind: LogKind): LogEntry {
		const entry: LogEntry = {
			id: crypto.randomUUID(),
			productId: this.product!.id,
			kind,
			data: {},
			position: this.logs(kind).length,
			version: 0
		};
		this.product!.logs.push(entry);
		this.touch();
		return entry;
	}
	updateLog(id: string, col: string, value: string) {
		const e = this.product!.logs.find((l) => l.id === id);
		if (!e) return;
		e.data[col] = value;
		this.touch();
	}
	removeLog(id: string) {
		const i = this.product!.logs.findIndex((l) => l.id === id);
		if (i >= 0) this.product!.logs.splice(i, 1);
		this.touch();
	}

	/* ---------- decisions ---------- */
	upsertDecision(d: Decision) {
		const list = this.product!.decisions;
		const i = list.findIndex((x) => x.id === d.id);
		if (i >= 0) list[i] = d;
		else list.unshift(d);
		this.touch();
	}
	removeDecision(id: string) {
		const list = this.product!.decisions;
		const i = list.findIndex((x) => x.id === id);
		if (i >= 0) list.splice(i, 1);
		this.touch();
	}

	/** Row-level saves for logs/decisions (simulated). */
	private touchTimer: ReturnType<typeof setTimeout> | undefined;
	private touch() {
		this.status.__rows = { state: 'saving' };
		clearTimeout(this.touchTimer);
		this.touchTimer = setTimeout(() => {
			this.status.__rows = { state: 'saved' };
			this.lastSavedAt = new Date().toISOString();
		}, 700 + LATENCY);
	}
}

export const workspace = new Workspace();
