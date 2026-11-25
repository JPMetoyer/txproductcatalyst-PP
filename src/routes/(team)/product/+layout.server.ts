import { error } from '@sveltejs/kit';
import { loadLessons, loadMilestones, loadProduct, loadReviews } from '$lib/server/repo';

export const load = async ({ locals, parent }) => {
	const { ctx } = await parent();
	if (!ctx?.productId) error(404, 'No product workspace found for this team.');
	const db = locals.supabase;
	const [{ product, comments }, milestones, reviews, lessons] = await Promise.all([
		loadProduct(db, ctx.productId, ctx.team.id),
		loadMilestones(db, ctx.semester.id),
		loadReviews(db, ctx.team.id),
		loadLessons(db, ctx.semester.id)
	]);
	return { product, comments, milestones, reviews, lessons, archived: ctx.semester.status === 'archived' };
};
