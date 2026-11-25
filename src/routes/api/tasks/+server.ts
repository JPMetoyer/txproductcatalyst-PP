import { error, json } from '@sveltejs/kit';
import { toTask } from '$lib/server/repo';
import { bad, body, date, dbFail, isUuid, text, uuid } from '$lib/server/validate';

const member = (v: unknown) => (v == null || v === '' ? null : isUuid(v) ? v : bad('Invalid assignee'));
const title = (v: unknown) => text(v, 'Task', 300).trim() || bad('Task title is required');

export const POST = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase
		.from('tasks')
		.insert({ team_id: uuid(b.teamId, 'team'), title: title(b.title), assigned_member_id: member(b.assignedMemberId), due_date: date(b.dueDate, 'due date') })
		.select()
		.single();
	if (e) dbFail(e, 'task');
	return json(toTask(data));
};

export const PATCH = async ({ request, locals }) => {
	const b = await body(request, locals);
	const patch: Record<string, unknown> = {};
	if ('title' in b) patch.title = title(b.title);
	if ('status' in b) patch.status = b.status === 'done' ? 'done' : b.status === 'open' ? 'open' : bad('Invalid status');
	if ('assignedMemberId' in b) patch.assigned_member_id = member(b.assignedMemberId);
	if ('dueDate' in b) patch.due_date = date(b.dueDate, 'due date');
	const { data, error: e } = await locals.supabase.from('tasks').update(patch).eq('id', uuid(b.id)).select();
	if (e) dbFail(e, 'task');
	if (!data.length) error(404, 'Task not found');
	return json(toTask(data[0]));
};

export const DELETE = async ({ request, locals }) => {
	const b = await body(request, locals);
	const { data, error: e } = await locals.supabase.from('tasks').delete().eq('id', uuid(b.id)).select('id');
	if (e) dbFail(e, 'task');
	if (!data.length) error(404, 'Task not found');
	return json({ ok: true });
};
