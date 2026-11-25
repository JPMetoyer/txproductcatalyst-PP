-- Phase 4: Business Model Studio, Feasibility Explorer, Demo Day, Career Center.

-------------------------------------------------------------------------------
-- Business Model Studio: one saved scenario per product (all models + costs in one JSON document).
-------------------------------------------------------------------------------
alter table public.business_model_scenarios drop constraint if exists business_model_scenarios_model_type_check;
alter table public.business_model_scenarios alter column model_type set default 'studio';
alter table public.business_model_scenarios add constraint business_model_scenarios_model_type_check check (model_type in ('studio'));
alter table public.business_model_scenarios add constraint business_model_scenarios_product_unique unique (product_id);

-- Conflict-safe save, same pattern as save_field.
create or replace function public.save_business_model(p_product uuid, p_assumptions jsonb, p_expected_version int) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
	r public.business_model_scenarios;
begin
	if not public.can_write_team(public.product_team(p_product)) then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	if p_expected_version = 0 then
		insert into public.business_model_scenarios (product_id, model_type, assumptions, version)
		values (p_product, 'studio', p_assumptions, 1)
		on conflict (product_id) do nothing
		returning * into r;
	else
		update public.business_model_scenarios
		set assumptions = p_assumptions, version = version + 1, updated_at = now()
		where product_id = p_product and version = p_expected_version
		returning * into r;
	end if;
	if r.id is not null then
		return jsonb_build_object('ok', true, 'version', r.version, 'assumptions', r.assumptions);
	end if;
	select * into r from public.business_model_scenarios where product_id = p_product;
	return jsonb_build_object('ok', false, 'reason', 'conflict', 'version', r.version, 'assumptions', r.assumptions);
end;
$$;
grant execute on function public.save_business_model(uuid, jsonb, int) to authenticated;
revoke execute on function public.save_business_model(uuid, jsonb, int) from anon;

-------------------------------------------------------------------------------
-- Demo Day: per-semester settings live in semesters.demo_day; per-team prep lives here.
-------------------------------------------------------------------------------
create table public.team_demo_day (
	team_id uuid primary key references public.teams (id) on delete cascade,
	readiness text not null default 'not-started' check (readiness in ('not-started', 'in-progress', 'ready')),
	checked text[] not null default '{}',
	updated_at timestamptz not null default now()
);
alter table public.team_demo_day enable row level security;
create policy "read demo day prep" on public.team_demo_day for select to authenticated using (public.can_read_team(team_id));
create policy "team writes demo day prep" on public.team_demo_day for all to authenticated
	using (public.can_write_team(team_id)) with check (public.can_write_team(team_id));
grant select, insert, update on public.team_demo_day to authenticated;
grant all on public.team_demo_day to service_role;

-- Default Demo Day settings (PRD §13 rubric) for semesters that don't have any yet. Admins edit these.
update public.semesters
set demo_day = jsonb_build_object(
	'date', null,
	'location', '',
	'instructions', 'Each team presents for 7 minutes, followed by 3 minutes of judge questions. Show the problem, the evidence, and how your product changed because of it.',
	'rubric', jsonb_build_array(
		jsonb_build_object('label', 'Problem and User Insight', 'points', 15),
		jsonb_build_object('label', 'Product and MVP', 'points', 15),
		jsonb_build_object('label', 'Prototype and Execution', 'points', 15),
		jsonb_build_object('label', 'Testing and Iteration', 'points', 15),
		jsonb_build_object('label', 'Market Opportunity and Differentiation', 'points', 10),
		jsonb_build_object('label', 'Business Model and Viability', 'points', 10),
		jsonb_build_object('label', 'Technical Feasibility', 'points', 10),
		jsonb_build_object('label', 'Product Strategy and Future', 'points', 5),
		jsonb_build_object('label', 'Pitch and Storytelling', 'points', 5)
	),
	'checklist', jsonb_build_array(
		'Product story drafted in Showcase',
		'Prototype link works without signing in',
		'Presentation link shared with view access',
		'Demo flow rehearsed end to end',
		'Each teammate knows their speaking part',
		'Answers drafted for likely judge questions',
		'Backup plan if the live demo fails'
	),
	'judgeQuestions', jsonb_build_array(
		'What evidence convinced you this problem is worth solving?',
		'Who pays, and why would they switch from what they use today?',
		'What is real in this prototype and what is mocked?',
		'What did testing change about your product?',
		'What would you build next with three more months?'
	),
	'resources', jsonb_build_array()
)
where demo_day = '{}'::jsonb;

-------------------------------------------------------------------------------
-- Career Center: shared resources (semester_id null) in the existing resources table.
-------------------------------------------------------------------------------
alter table public.resources drop constraint if exists resources_url_check;
alter table public.resources add constraint resources_url_check check (url is null or url = '' or url ~ '^https?://');
create index if not exists resources_category_idx on public.resources (category, position);

insert into public.resources (category, title, body, position) values
	('career:frameworks', 'Product sense: CIRCLES-style walkthrough', E'1. Clarify the goal and constraints\n2. Identify the users and pick one segment\n3. Report their needs and pain points (from evidence)\n4. Cut through prioritization: which need matters most?\n5. List solutions, then pick one with reasoning\n6. Evaluate trade-offs and risks\n7. Summarize and define success metrics', 0),
	('career:frameworks', 'Metrics: goal → signals → metrics', E'Start from the product goal, name the user behaviors that show progress (signals), then choose 1 north-star metric plus 2–3 guardrails. Always say how you would detect a false positive.', 1),
	('career:frameworks', 'Behavioral: STAR with a decision', E'Situation · Task · Action · Result — and add the Decision you made and what evidence drove it. Your Product Project decision log is a ready-made source of stories.', 2),
	('career:product-sense', 'Design a product for first-time renters.', '', 0),
	('career:product-sense', 'How would you improve a tool your team used this semester?', '', 1),
	('career:product-sense', 'Design a product to help young adults find community after moving.', '', 2),
	('career:strategy', 'Should a budgeting app expand into credit building? Why or why not?', '', 0),
	('career:strategy', 'Your competitor just launched your core feature for free. What do you do?', '', 1),
	('career:metrics', 'Weekly active users dropped 10% last week. How do you investigate?', '', 0),
	('career:metrics', 'What is the north-star metric for your Product Project, and why?', '', 1),
	('career:behavioral', 'Tell me about a time evidence changed your mind.', '', 0),
	('career:behavioral', 'Tell me about a disagreement on your team and how you resolved it.', '', 1),
	('career:behavioral', 'Tell me about a product decision you would make differently now.', '', 2),
	('career:resume', 'Discovery', 'Interviewed 12 first-time renters and 3 property managers to validate a bill-splitting problem, narrowing the target segment and redirecting the roadmap toward B2B licensing.', 0),
	('career:resume', 'Prioritization', 'Prioritized 14 candidate features with a MoSCoW framework to scope a 4-feature MVP, cutting build scope by ~60% while preserving the core user journey.', 1),
	('career:resume', 'Validation', 'Ran 8 moderated usability tests on a Figma prototype; resolved 5 usability issues and raised task completion from 50% to 88%.', 2),
	('career:portfolio', 'Case study outline', E'1. The problem (one sentence + who has it)\n2. What we learned (2–3 insights with evidence)\n3. Key decisions (from your decision log)\n4. The product (screens + core journey)\n5. Results and what changed after testing\n6. What I would do next\n7. My role and what I learned', 0),
	('career:recruiting', 'Build your PM story bank', 'Pick 5 moments from your Product Project (a pivot, a conflict, a failed test, a hard prioritization call, a win) and write each as a STAR story.', 0),
	('career:reflection', 'What assumption were you most wrong about, and how did you find out?', '', 0),
	('career:reflection', 'Which decision in your decision log are you proudest of?', '', 1),
	('career:reflection', 'What would you tell a new team on day one of this challenge?', '', 2);
