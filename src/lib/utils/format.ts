// Date helpers. Dates are stored as 'YYYY-MM-DD'; parse as local dates to avoid off-by-one timezone shifts.

const parse = (d: string) => (d.length === 10 ? new Date(`${d}T12:00:00`) : new Date(d));

export const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) =>
	parse(d).toLocaleDateString('en-US', opts);

export const fmtShort = (d: string) => fmtDate(d, { month: 'short', day: 'numeric' });

export const daysBetween = (from: string, to: string) => Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000);

export function relativeDays(today: string, target: string): string {
	const n = daysBetween(today, target);
	if (n === 0) return 'today';
	if (n === 1) return 'tomorrow';
	if (n === -1) return 'yesterday';
	return n > 0 ? `in ${n} days` : `${-n} days ago`;
}

export function timeAgo(iso: string, now: string): string {
	const mins = Math.round((parse(now).getTime() - new Date(iso).getTime()) / 60_000);
	if (mins < 60) return `${Math.max(mins, 1)}m ago`;
	const h = Math.round(mins / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.round(h / 24)}d ago`;
}
