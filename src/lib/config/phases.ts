import type { JourneyPhase, PhaseKey } from '$lib/types/domain';

export interface PhaseMeta {
	key: PhaseKey;
	label: string;
	tagline: string;
	gm: string | null; // curriculum session that introduces it
	accent: 'blue' | 'pink' | 'orange' | 'lavender' | 'ink';
}

export const PHASES: PhaseMeta[] = [
	{ key: 'overview', label: 'Overview', tagline: 'Your product at a glance', gm: null, accent: 'ink' },
	{ key: 'discover', label: 'Discover', tagline: 'Customer & problem discovery', gm: 'GM2', accent: 'blue' },
	{ key: 'position', label: 'Position', tagline: 'Market & differentiation', gm: 'GM3', accent: 'lavender' },
	{ key: 'monetize', label: 'Monetize', tagline: 'Business model & viability', gm: 'GM4', accent: 'orange' },
	{ key: 'scope', label: 'Scope', tagline: 'Feasibility & MVP', gm: 'GM5', accent: 'pink' },
	{ key: 'build', label: 'Build', tagline: 'Design & prototyping', gm: 'GM6', accent: 'blue' },
	{ key: 'validate', label: 'Validate', tagline: 'Testing & iteration', gm: 'GM7', accent: 'lavender' },
	{ key: 'showcase', label: 'Showcase', tagline: 'Demo Day preparation', gm: 'GM9', accent: 'orange' }
];

export const JOURNEY: JourneyPhase[] = ['discover', 'position', 'monetize', 'scope', 'build', 'validate', 'showcase'];

export const phaseMeta = (key: PhaseKey): PhaseMeta => PHASES.find((p) => p.key === key) ?? PHASES[0];
