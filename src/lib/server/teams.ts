// Team summaries for mentor and admin dashboards. RLS scopes the rows:
// mentors get only their assigned teams, admins get every team.

import type { SupabaseClient } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';
import { recommendedPhase } from '$lib/config/phases';
import type { JourneyPhase, MilestoneStatus } from '$lib/types/domain';
import { loadLessons, loadMilestones, toReview } from './repo';

export interface TeamFlag {
	id: string;
	teamId: string;
	reason: string;
	flaggedBy: string;
	createdAt: string;
	clearedAt: string | null;
}

export interface TeamSummary {
	id: string;
	name: string;
	status: 'active' | 'archived';
	challengeTitle: string | null;
	mentorNames: string[];
	rosterCount: number;
	currentPhase: JourneyPhase;
	recommendedPhase: JourneyPhase;
	nextMilestoneStatus: MilestoneStatus;
	blockers: string[];
	followUps: number;
	flags: TeamFlag[];
	demoDayReadiness: string;
	lastActivityAt: string;
	productId: string | null;
}

export async function activeSemester(db: SupabaseClient) {
	const { data } = await db.from('semesters').select('id, name, theme, start_date, end_date, status').eq('status', 'active').maybeSingle();
	return data as { id: string; name: string; theme: string; start_date: string; end_date: string; status: string } | null;
}

export const toFlag = (f: any): TeamFlag => ({
	id: f.id,
	teamId: f.team_id,
	reason: f.reason,
	flaggedBy: f.flagger?.display_name ?? 'Unknown',
	createdAt: f.created_at,
	clearedAt: f.cleared_at
});
export const FLAG_SELECT = 'id, team_id, reason, created_at, cleared_at, flagger:profiles!team_flags_flagged_by_fkey(display_name)';

export async function loadTeamSummaries(db: SupabaseClient, today: string, semesterId?: string) {
	const sem = semesterId
		? ((await db.from('semesters').select('id, name, theme, start_date, end_date, status').eq('id', semesterId).maybeSingle()).data as Awaited<ReturnType<typeof activeSemester>>)
		: await activeSemester(db);
	if (!sem) return { semester: null, teams: [] as TeamSummary[], milestones: [], lessons: [] };

	const [teams, milestones, lessons, flags] = await Promise.all([
		db
			.from('teams')
			.select(
				'id, name, status, current_phase, created_at, challenge:challenges(title), team_members(active), team_mentors(profile:profiles(display_name)), products(id, updated_at), milestone_reviews(*), team_demo_day(readiness)'
			)
			.eq('semester_id', sem.id)
			.order('name'),
		loadMilestones(db, sem.id),
		loadLessons(db, sem.id),
		db.from('team_flags').select(FLAG_SELECT).is('cleared_at', null).order('created_at', { ascending: false })
	]);
	if (teams.error) error(500, 'Could not load teams');

	const rec = recommendedPhase(lessons, today);
	const next = milestones.find((m) => m.targetDate >= today) ?? milestones.at(-1);
	const openFlags = (flags.data ?? []).map(toFlag);

	const summaries: TeamSummary[] = (teams.data as any[]).map((t) => {
		const reviews = (t.milestone_reviews ?? []).map(toReview);
		const product = Array.isArray(t.products) ? t.products[0] : t.products;
		return {
			id: t.id,
			name: t.name,
			status: t.status,
			challengeTitle: t.challenge?.title ?? null,
			mentorNames: (t.team_mentors ?? []).map((m: any) => m.profile?.display_name).filter(Boolean),
			rosterCount: (t.team_members ?? []).filter((m: any) => m.active).length,
			currentPhase: t.current_phase,
			recommendedPhase: rec,
			nextMilestoneStatus: (next && reviews.find((r: any) => r.milestoneId === next.id)?.status) || 'upcoming',
			blockers: reviews.map((r: any) => r.blockers).filter((b: string) => b.trim()),
			followUps: reviews.filter((r: any) => r.status === 'follow-up').length,
			flags: openFlags.filter((f) => f.teamId === t.id),
			demoDayReadiness: (Array.isArray(t.team_demo_day) ? t.team_demo_day[0] : t.team_demo_day)?.readiness ?? 'not-started',
			lastActivityAt: product?.updated_at ?? t.created_at,
			productId: product?.id ?? null
		};
	});
	return { semester: sem, teams: summaries, milestones, lessons, reviews: (teams.data as any[]).flatMap((t) => t.milestone_reviews ?? []).map(toReview) };
}
