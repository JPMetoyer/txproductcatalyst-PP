import { loadTeamSummaries } from '$lib/server/teams';
import { todayISO } from '$lib/server/repo';

export const load = async ({ locals }) => {
	const today = todayISO();
	const { teams, milestones, reviews = [] } = await loadTeamSummaries(locals.supabase, today);
	const me = locals.profile!.id;
	const name = (id: string) => teams.find((t) => t.id === id)?.name ?? '';
	const title = (id: string) => milestones.find((m) => m.id === id)?.title ?? '';
	return {
		today,
		teams,
		nextMilestone: milestones.find((m) => m.targetDate >= today) ?? null,
		ready: reviews
			.filter((r) => r.status === 'ready')
			.map((r) => ({ id: r.id, teamId: r.teamId, teamName: name(r.teamId), milestone: title(r.milestoneId), readyAt: r.readyAt })),
		blockers: reviews.filter((r) => r.blockers.trim()).map((r) => ({ id: r.id, teamName: name(r.teamId), text: r.blockers })),
		history: reviews
			.filter((r) => r.reviewedAt && r.reviewerId === me)
			.sort((a, b) => b.reviewedAt!.localeCompare(a.reviewedAt!))
			.map((r) => ({ id: r.id, teamName: name(r.teamId), milestone: title(r.milestoneId), status: r.status, at: r.reviewedAt!, feedback: r.feedback }))
	};
};
