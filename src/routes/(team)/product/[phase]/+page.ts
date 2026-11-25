import { error } from '@sveltejs/kit';
import { PHASES } from '$lib/config/phases';
import type { PhaseKey } from '$lib/types/domain';

export const load = ({ params }) => {
	if (!PHASES.some((p) => p.key === params.phase)) error(404, 'Section not found');
	return { phase: params.phase as PhaseKey };
};
