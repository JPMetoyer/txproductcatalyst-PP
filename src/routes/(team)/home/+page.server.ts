import { error } from '@sveltejs/kit';
import { loadAnnouncements, loadLatestFeedback, loadLessons, loadMilestones, loadReviews, loadTasks } from '$lib/server/repo';

export const load = async ({ locals, parent }) => {
	const { ctx, today } = await parent();
	if (!ctx) error(404, 'No team workspace found for this account. Ask your Academics Committee contact.');
	const db = locals.supabase;
	const [tasks, lessons, milestones, reviews, feedback, announcements, proto] = await Promise.all([
		loadTasks(db, ctx.team.id),
		loadLessons(db, ctx.semester.id),
		loadMilestones(db, ctx.semester.id),
		loadReviews(db, ctx.team.id),
		loadLatestFeedback(db, ctx.team.id),
		loadAnnouncements(db, ctx.semester.id),
		db.from('product_fields').select('value').eq('product_id', ctx.productId).eq('field_key', 'ov.prototype').maybeSingle()
	]);
	const milestone = milestones.find((m) => m.targetDate >= today) ?? milestones.at(-1) ?? null;
	return {
		tasks,
		lesson: lessons.find((l) => l.scheduledDate >= today) ?? null,
		milestone,
		review: milestone ? (reviews.find((r) => r.milestoneId === milestone.id) ?? null) : null,
		feedback,
		announcement: announcements[0] ?? null,
		prototypeUrl: (proto.data?.value as string) || null
	};
};
