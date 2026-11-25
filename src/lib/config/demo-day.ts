// Demo Day settings (PRD §13), stored per semester in semesters.demo_day.

export interface RubricRow {
	label: string;
	points: number;
	description?: string;
}
export interface DemoDaySettings {
	date: string | null; // YYYY-MM-DD
	time: string; // free text, e.g. "6–8 PM"
	location: string;
	instructions: string;
	rubric: RubricRow[];
	checklist: string[];
	judgeQuestions: string[];
	resources: { title: string; url: string }[];
}

export const DEFAULT_DEMO_DAY: DemoDaySettings = {
	date: null,
	time: '',
	location: '',
	instructions: '',
	rubric: [
		{ label: 'Problem and User Insight', points: 15 },
		{ label: 'Product and MVP', points: 15 },
		{ label: 'Prototype and Execution', points: 15 },
		{ label: 'Testing and Iteration', points: 15 },
		{ label: 'Market Opportunity and Differentiation', points: 10 },
		{ label: 'Business Model and Viability', points: 10 },
		{ label: 'Technical Feasibility', points: 10 },
		{ label: 'Product Strategy and Future', points: 5 },
		{ label: 'Pitch and Storytelling', points: 5 }
	],
	checklist: [],
	judgeQuestions: [],
	resources: []
};

export const READINESS = [
	{ key: 'not-started', label: 'Not started', tone: 'neutral' },
	{ key: 'in-progress', label: 'In progress', tone: 'orange' },
	{ key: 'ready', label: 'Ready', tone: 'green' }
] as const;
export type Readiness = (typeof READINESS)[number]['key'];

/** Tolerant parse of stored JSON; missing pieces fall back to defaults. */
export function parseDemoDay(raw: unknown): DemoDaySettings {
	const r = (typeof raw === 'object' && raw ? raw : {}) as Record<string, unknown>;
	const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);
	const rubric = Array.isArray(r.rubric)
		? (r.rubric as Record<string, unknown>[])
				.filter((x) => x && typeof x.label === 'string' && x.label.trim())
				.map((x) => ({ label: String(x.label), points: Math.max(0, Math.round(Number(x.points) || 0)), description: typeof x.description === 'string' ? x.description : '' }))
		: DEFAULT_DEMO_DAY.rubric;
	return {
		date: typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null,
		time: typeof r.time === 'string' ? r.time : '',
		location: typeof r.location === 'string' ? r.location : '',
		instructions: typeof r.instructions === 'string' ? r.instructions : '',
		rubric: rubric.length ? rubric : DEFAULT_DEMO_DAY.rubric,
		checklist: strs(r.checklist),
		judgeQuestions: strs(r.judgeQuestions),
		resources: Array.isArray(r.resources)
			? (r.resources as Record<string, unknown>[]).filter((x) => x && typeof x.url === 'string' && /^https?:\/\//.test(x.url)).map((x) => ({ title: String(x.title || x.url), url: String(x.url) }))
			: []
	};
}

export const rubricTotal = (rows: RubricRow[]) => rows.reduce((n, r) => n + r.points, 0);
