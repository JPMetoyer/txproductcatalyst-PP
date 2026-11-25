import { existsSync, readFileSync } from 'node:fs';

export type Cred = { role: string; name: string; email: string; password: string };
export const creds: Cred[] = existsSync('.seed-credentials.json') ? JSON.parse(readFileSync('.seed-credentials.json', 'utf8')) : [];
export const base = process.env.STUDIO_URL ?? 'http://localhost:5173';
export const serverUp = () => fetch(`${base}/login`).then((r) => r.ok).catch(() => false);

/** Signs in through the real /login form action; returns a cookie header for later requests. */
export async function login(name: string, password?: string) {
	const c = creds.find((x) => x.name === name)!;
	const res = await fetch(`${base}/login`, {
		method: 'POST',
		body: new URLSearchParams({ login: c.email.split('@')[0], password: password ?? c.password }),
		headers: { origin: base, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
		redirect: 'manual'
	});
	const cookie = res.headers.getSetCookie().map((h) => h.split(';')[0]).join('; ');
	return { res, cookie, json: res.headers.get('content-type')?.includes('json') ? await res.json() : null };
}

export const get = (path: string, cookie: string) => fetch(`${base}${path}`, { headers: { cookie }, redirect: 'manual' });

export async function api(cookie: string, method: string, path: string, body: unknown) {
	const res = await fetch(`${base}${path}`, {
		method,
		headers: { cookie, origin: base, 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
	return { status: res.status, body: await res.json().catch(() => null) };
}

/** Submits a SvelteKit form action. Returns { type: 'success' | 'failure' | 'redirect' | 'error', status }. */
export async function action(cookie: string, path: string, fields: Record<string, string>) {
	const res = await fetch(`${base}${path}`, {
		method: 'POST',
		headers: { cookie, origin: base, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json', 'x-sveltekit-action': 'true' },
		body: new URLSearchParams(fields),
		redirect: 'manual'
	});
	const body = await res.json().catch(() => ({}));
	return { type: body.type as string, status: body.status ?? res.status, data: body.data as string | undefined };
}
