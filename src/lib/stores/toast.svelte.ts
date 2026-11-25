export type ToastKind = 'info' | 'success' | 'error';
export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
}

let nextId = 1;
export const toasts = $state<Toast[]>([]);

export function toast(message: string, kind: ToastKind = 'info', ms = 3200) {
	const id = nextId++;
	toasts.push({ id, kind, message });
	setTimeout(() => dismiss(id), ms);
}

export function dismiss(id: number) {
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}
