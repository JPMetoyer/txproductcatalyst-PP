import { untrack } from 'svelte';

export type ToastKind = 'info' | 'success' | 'error';
export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
}

let nextId = 1;
export const toasts = $state<Toast[]>([]);

// untrack: toast() is often called from inside $effect blocks. Without it, the effect would
// subscribe to the toast list and re-run (adding another toast) every time a toast appears.
export function toast(message: string, kind: ToastKind = 'info', ms = 3200) {
	untrack(() => {
		const id = nextId++;
		// Don't stack identical messages that are already showing.
		if (toasts.some((t) => t.message === message)) return;
		toasts.push({ id, kind, message });
		setTimeout(() => dismiss(id), ms);
	});
}

export function dismiss(id: number) {
	untrack(() => {
		const i = toasts.findIndex((t) => t.id === id);
		if (i >= 0) toasts.splice(i, 1);
	});
}
