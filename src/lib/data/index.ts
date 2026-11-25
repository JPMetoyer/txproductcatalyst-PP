// Repository layer. Pages and components import data access from here only.
// Phase 0: backed by in-memory mock data.
// Phase 1: these become `+page.server.ts` loads calling Supabase with the user's session (RLS enforced).

import * as m from './mock';
import { JOURNEY } from '$lib/config/phases';
import type { Team } from '$lib/types/domain';

export const today = () => m.MOCK_TODAY;
export const getSemester = () => m.semester;

export const getChallenges = (opts: { publishedOnly?: boolean } = {}) =>
	m.challenges.filter((c) => !opts.publishedOnly || c.published);
export const getChallenge = (id: string) => m.byId(m.challenges, id);

export const getTeam = (id: string) => m.byId(m.teams, id);
export const getTeams = () => m.teams;
export const getRoster = (teamId: string) => m.teamMembers.filter((x) => x.teamId === teamId && x.active);
export const getMentor = (id: string) => m.byId(m.profiles, id);
export const getMentors = () => m.mentors;
export const getProduct = (teamId: string) => m.products.find((p) => p.teamId === teamId);
export const getTasks = (teamId: string) => m.tasks.filter((t) => t.teamId === teamId);
export const getLessons = () => [...m.lessons].sort((a, b) => a.gmNumber - b.gmNumber);
export const getMilestones = () => m.milestones;
export const getReviews = (teamId?: string) => m.milestoneReviews.filter((r) => !teamId || r.teamId === teamId);
export const getFeedback = (teamId: string) =>
	m.feedback.filter((f) => f.teamId === teamId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getAnnouncements = () => m.announcements;
export const getFieldComments = (productId: string) => m.fieldComments.filter((c) => c.productId === productId);

/** Next GM on or after today. */
export const getUpcomingLesson = () => getLessons().find((l) => l.scheduledDate >= today()) ?? null;

/** Next milestone whose target date is on or after today. */
export const getNextMilestone = () => m.milestones.find((ms) => ms.targetDate >= today()) ?? m.milestones.at(-1)!;

export const getReview = (teamId: string, milestoneId: string) =>
	m.milestoneReviews.find((r) => r.teamId === teamId && r.milestoneId === milestoneId);

/** Mock "current user" ids for each role in the prototype. */
export const DEMO = { teamId: 't-1', mentorId: 'p-mentor-1' } as const;

export const teamsForMentor = (mentorId: string): Team[] => m.teams.filter((t) => t.mentorIds.includes(mentorId));

export const teamsNeedingSupport = () =>
	m.teams.filter((t) =>
		m.milestoneReviews.some((r) => r.teamId === t.id && (r.status === 'follow-up' || r.blockers.trim() !== ''))
	);

export const phaseIndex = (p: Team['currentPhase']) => JOURNEY.indexOf(p);
