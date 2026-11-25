-- TPC Studio — core schema, access-control helpers, row-level security, and RPCs.
-- See docs/PLAN.md §4 for the design. Applied with `npm run db:migrate`.
--
-- Access model (enforced here, not in the app):
--   team   → own team's private data, read + write
--   mentor → assigned teams, read-only (plus reviews and comments)
--   admin  → everything
--   anon   → published challenges only, and only when the semester enables public browsing

create extension if not exists pgcrypto;

-------------------------------------------------------------------------------
-- Enums
-------------------------------------------------------------------------------
create type public.app_role as enum ('team', 'mentor', 'admin');
create type public.semester_status as enum ('active', 'archived');
create type public.team_status as enum ('active', 'archived');
create type public.journey_phase as enum ('discover', 'position', 'monetize', 'scope', 'build', 'validate', 'showcase');
create type public.milestone_status as enum ('upcoming', 'ready', 'reviewed', 'follow-up');
create type public.decision_status as enum ('proposed', 'accepted', 'reconsidering', 'reversed');
create type public.field_evidence as enum ('assumption', 'validated');
create type public.log_kind as enum ('research', 'competitor', 'feature', 'testing', 'iteration');
create type public.task_status as enum ('open', 'done');
create type public.feasibility_status as enum ('not-investigated', 'investigating', 'supported', 'blocker', 'not-applicable');

-------------------------------------------------------------------------------
-- Tables
-------------------------------------------------------------------------------
create table public.semesters (
	id uuid primary key default gen_random_uuid(),
	name text not null check (length(name) between 1 and 80),
	theme text not null default '',
	start_date date not null,
	end_date date not null,
	status public.semester_status not null default 'active',
	public_marketplace boolean not null default false,
	gm_schedule jsonb not null default '[]',
	demo_day jsonb not null default '{}', -- { date, location, instructions, rubric: [{label, points}] }
	created_at timestamptz not null default now(),
	check (end_date >= start_date)
);

create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text not null check (length(display_name) between 1 and 120),
	role public.app_role not null,
	active boolean not null default true,
	created_at timestamptz not null default now()
);

create table public.challenges (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid not null references public.semesters (id) on delete restrict,
	code text not null check (length(code) between 1 and 20),
	title text not null check (length(title) between 1 and 120),
	summary text not null default '',
	icon text not null default 'home',
	accent text not null default 'blue' check (accent in ('blue', 'pink', 'orange', 'lavender')),
	experience text not null default '',
	mission text not null default '',
	stakeholders text[] not null default '{}',
	research_considerations text[] not null default '{}',
	boundaries text[] not null default '{}',
	expectations text[] not null default '{}',
	published boolean not null default false,
	position int not null default 0,
	unique (semester_id, code)
);

create table public.teams (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid not null references public.semesters (id) on delete restrict,
	name text not null check (length(name) between 1 and 80),
	account_profile_id uuid unique references public.profiles (id) on delete set null,
	challenge_id uuid references public.challenges (id) on delete set null,
	status public.team_status not null default 'active',
	current_phase public.journey_phase not null default 'discover',
	created_at timestamptz not null default now(),
	unique (semester_id, name)
);

create table public.team_mentors (
	team_id uuid not null references public.teams (id) on delete cascade,
	mentor_profile_id uuid not null references public.profiles (id) on delete cascade,
	primary key (team_id, mentor_profile_id)
);

-- Roster entries are names only (no accounts). Removing someone sets active=false; nothing is deleted.
create table public.team_members (
	id uuid primary key default gen_random_uuid(),
	team_id uuid not null references public.teams (id) on delete restrict,
	name text not null check (length(name) between 1 and 80),
	active boolean not null default true,
	created_at timestamptz not null default now()
);

create table public.products (
	id uuid primary key default gen_random_uuid(),
	team_id uuid not null unique references public.teams (id) on delete restrict,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- One row per documentation field. `version` gives per-field optimistic concurrency (PLAN.md R4).
create table public.product_fields (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products (id) on delete cascade,
	field_key text not null check (field_key ~ '^[a-z]{2}\.[A-Za-z0-9]+$'),
	value jsonb,
	evidence public.field_evidence,
	version int not null default 1,
	updated_at timestamptz not null default now(),
	unique (product_id, field_key),
	check (pg_column_size(value) < 65536)
);

create table public.log_entries (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products (id) on delete cascade,
	kind public.log_kind not null,
	data jsonb not null default '{}' check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 65536),
	position int not null default 0,
	version int not null default 1,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.product_decisions (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products (id) on delete cascade,
	title text not null check (length(title) between 1 and 200),
	decided_on date not null default current_date,
	phase public.journey_phase not null,
	description text not null default '',
	alternatives text not null default '',
	evidence text not null default '',
	reasoning text not null default '',
	attribution text not null default '',
	status public.decision_status not null default 'proposed',
	version int not null default 1,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.field_comments (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products (id) on delete cascade,
	field_key text not null,
	author_profile_id uuid not null references public.profiles (id) on delete restrict,
	body text not null check (length(body) between 1 and 4000),
	resolved boolean not null default false,
	created_at timestamptz not null default now()
);

create table public.feasibility_assessments (
	product_id uuid not null references public.products (id) on delete cascade,
	area text not null check (area in ('technology', 'data', 'integrations', 'access', 'privacy', 'complexity', 'costs', 'prototype')),
	status public.feasibility_status not null default 'not-investigated',
	notes text not null default '',
	evidence text not null default '',
	version int not null default 1,
	updated_at timestamptz not null default now(),
	primary key (product_id, area)
);

create table public.business_model_scenarios (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products (id) on delete cascade,
	model_type text not null check (model_type in ('subscription', 'transaction', 'licensing')),
	assumptions jsonb not null default '{}',
	version int not null default 1,
	updated_at timestamptz not null default now()
);

create table public.tasks (
	id uuid primary key default gen_random_uuid(),
	team_id uuid not null references public.teams (id) on delete cascade,
	assigned_member_id uuid references public.team_members (id) on delete set null,
	title text not null check (length(title) between 1 and 300),
	status public.task_status not null default 'open',
	due_date date,
	created_at timestamptz not null default now()
);

create table public.lessons (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid not null references public.semesters (id) on delete restrict,
	gm_number int not null check (gm_number between 1 and 20),
	title text not null,
	scheduled_date date,
	description text not null default '',
	content jsonb not null default '{}', -- objectives, slide_url, key_concepts, examples, activity, tools, resources
	related_phase text,
	published boolean not null default false,
	position int not null default 0,
	unique (semester_id, gm_number)
);

create table public.milestones (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid not null references public.semesters (id) on delete restrict,
	number int not null check (number between 1 and 10),
	title text not null,
	description text not null default '',
	after_gm text not null default '',
	target_date date,
	review_areas text[] not null default '{}',
	review_questions text[] not null default '{}',
	related_phases public.journey_phase[] not null default '{}',
	unique (semester_id, number)
);

create table public.milestone_reviews (
	id uuid primary key default gen_random_uuid(),
	milestone_id uuid not null references public.milestones (id) on delete cascade,
	team_id uuid not null references public.teams (id) on delete cascade,
	reviewer_profile_id uuid references public.profiles (id) on delete set null,
	status public.milestone_status not null default 'upcoming',
	feedback text not null default '',
	next_steps text not null default '',
	blockers text not null default '',
	flagged boolean not null default false,
	ready_at timestamptz,
	reviewed_at timestamptz,
	updated_at timestamptz not null default now(),
	unique (milestone_id, team_id)
);

create table public.resources (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid references public.semesters (id) on delete cascade,
	team_id uuid references public.teams (id) on delete cascade, -- null = shared resource
	category text not null, -- e.g. 'career:interview', 'academy', 'demo-day'
	title text not null,
	url text check (url is null or url ~ '^https?://'),
	body text not null default '',
	position int not null default 0
);

create table public.announcements (
	id uuid primary key default gen_random_uuid(),
	semester_id uuid not null references public.semesters (id) on delete cascade,
	title text not null,
	body text not null default '',
	published_at timestamptz
);

create index on public.teams (semester_id);
create index on public.team_members (team_id);
create index on public.team_mentors (mentor_profile_id);
create index on public.product_fields (product_id);
create index on public.log_entries (product_id, kind);
create index on public.product_decisions (product_id);
create index on public.field_comments (product_id);
create index on public.tasks (team_id);
create index on public.milestone_reviews (team_id);

-------------------------------------------------------------------------------
-- Access-control helpers. SECURITY DEFINER so they can read profiles/teams
-- without recursing through those tables' own RLS policies.
-------------------------------------------------------------------------------
create or replace function public.my_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
	select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
	select coalesce((select role = 'admin' from public.profiles where id = auth.uid() and active), false)
$$;

create or replace function public.my_team_id() returns uuid
language sql stable security definer set search_path = '' as $$
	select t.id from public.teams t
	join public.profiles p on p.id = t.account_profile_id
	where t.account_profile_id = auth.uid() and p.active and p.role = 'team'
$$;

create or replace function public.mentors_team(p_team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.team_mentors tm
		join public.profiles p on p.id = tm.mentor_profile_id
		where tm.team_id = p_team and tm.mentor_profile_id = auth.uid() and p.active and p.role = 'mentor'
	)
$$;

create or replace function public.can_read_team(p_team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select public.is_admin() or p_team = public.my_team_id() or public.mentors_team(p_team)
$$;

-- Teams can write only while their team is active (archived semesters become read-only).
create or replace function public.can_write_team(p_team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select public.is_admin() or (
		p_team = public.my_team_id()
		and exists (select 1 from public.teams where id = p_team and status = 'active')
	)
$$;

create or replace function public.product_team(p_product uuid) returns uuid
language sql stable security definer set search_path = '' as $$
	select team_id from public.products where id = p_product
$$;

-------------------------------------------------------------------------------
-- Row-level security
-------------------------------------------------------------------------------
alter table public.semesters enable row level security;
alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.teams enable row level security;
alter table public.team_mentors enable row level security;
alter table public.team_members enable row level security;
alter table public.products enable row level security;
alter table public.product_fields enable row level security;
alter table public.log_entries enable row level security;
alter table public.product_decisions enable row level security;
alter table public.field_comments enable row level security;
alter table public.feasibility_assessments enable row level security;
alter table public.business_model_scenarios enable row level security;
alter table public.tasks enable row level security;
alter table public.lessons enable row level security;
alter table public.milestones enable row level security;
alter table public.milestone_reviews enable row level security;
alter table public.resources enable row level security;
alter table public.announcements enable row level security;

-- Shared semester content: any signed-in user reads; admins write.
create policy "read semesters" on public.semesters for select to authenticated using (true);
create policy "admin semesters" on public.semesters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "anon reads public semesters" on public.semesters for select to anon using (public_marketplace);

create policy "read milestones" on public.milestones for select to authenticated using (true);
create policy "admin milestones" on public.milestones for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read published lessons" on public.lessons for select to authenticated using (published or public.is_admin());
create policy "admin lessons" on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read announcements" on public.announcements for select to authenticated using (published_at is not null and published_at <= now() or public.is_admin());
create policy "admin announcements" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read published challenges" on public.challenges for select to authenticated using (published or public.is_admin());
create policy "anon reads public challenges" on public.challenges for select to anon
	using (published and exists (select 1 from public.semesters s where s.id = semester_id and s.public_marketplace));
create policy "admin challenges" on public.challenges for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read resources" on public.resources for select to authenticated
	using (team_id is null or public.can_read_team(team_id));
create policy "team writes own resources" on public.resources for all to authenticated
	using (team_id is not null and public.can_write_team(team_id))
	with check (team_id is not null and public.can_write_team(team_id));
create policy "admin resources" on public.resources for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles: self, admins, and mentor names (shown to teams). Writes happen server-side only.
create policy "read profiles" on public.profiles for select to authenticated
	using (id = auth.uid() or public.is_admin() or role = 'mentor');

-- Teams and rosters: visible to the team, its mentors, admins. Admin-only writes.
create policy "read teams" on public.teams for select to authenticated using (public.can_read_team(id));
create policy "admin teams" on public.teams for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read team mentors" on public.team_mentors for select to authenticated
	using (public.is_admin() or mentor_profile_id = auth.uid() or team_id = public.my_team_id());
create policy "admin team mentors" on public.team_mentors for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read roster" on public.team_members for select to authenticated using (public.can_read_team(team_id));
create policy "admin roster" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "read products" on public.products for select to authenticated using (public.can_read_team(team_id));
create policy "admin products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Product documentation: team + admin write, mentors read.
create policy "read fields" on public.product_fields for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "write fields" on public.product_fields for all to authenticated
	using (public.can_write_team(public.product_team(product_id)))
	with check (public.can_write_team(public.product_team(product_id)));

create policy "read logs" on public.log_entries for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "write logs" on public.log_entries for all to authenticated
	using (public.can_write_team(public.product_team(product_id)))
	with check (public.can_write_team(public.product_team(product_id)));

create policy "read decisions" on public.product_decisions for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "write decisions" on public.product_decisions for all to authenticated
	using (public.can_write_team(public.product_team(product_id)))
	with check (public.can_write_team(public.product_team(product_id)));

create policy "read feasibility" on public.feasibility_assessments for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "write feasibility" on public.feasibility_assessments for all to authenticated
	using (public.can_write_team(public.product_team(product_id)))
	with check (public.can_write_team(public.product_team(product_id)));

create policy "read scenarios" on public.business_model_scenarios for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "write scenarios" on public.business_model_scenarios for all to authenticated
	using (public.can_write_team(public.product_team(product_id)))
	with check (public.can_write_team(public.product_team(product_id)));

create policy "read tasks" on public.tasks for select to authenticated using (public.can_read_team(team_id));
create policy "write tasks" on public.tasks for all to authenticated using (public.can_write_team(team_id)) with check (public.can_write_team(team_id));

-- Comments: everyone who can read the team sees them; mentors/admins write their own.
create policy "read comments" on public.field_comments for select to authenticated using (public.can_read_team(public.product_team(product_id)));
create policy "mentor or admin comments" on public.field_comments for insert to authenticated
	with check (author_profile_id = auth.uid() and (public.is_admin() or public.mentors_team(public.product_team(product_id))));
create policy "edit own comments" on public.field_comments for update to authenticated
	using (author_profile_id = auth.uid() or public.is_admin()) with check (author_profile_id = auth.uid() or public.is_admin());
create policy "delete own comments" on public.field_comments for delete to authenticated
	using (author_profile_id = auth.uid() or public.is_admin());

-- Milestone reviews: mentors (assigned) and admins write; teams read and use mark_milestone_ready().
create policy "read reviews" on public.milestone_reviews for select to authenticated using (public.can_read_team(team_id));
create policy "mentor or admin reviews" on public.milestone_reviews for all to authenticated
	using (public.is_admin() or public.mentors_team(team_id))
	with check (public.is_admin() or public.mentors_team(team_id));

-------------------------------------------------------------------------------
-- Grants. RLS above is what actually restricts rows; these only expose tables to the API.
-------------------------------------------------------------------------------
-- Supabase's default privileges grant new public tables to anon as well; take that back first.
revoke all on all tables in schema public from anon;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.challenges, public.semesters to anon;
revoke insert, update, delete on public.profiles from authenticated; -- profiles change only via server actions

-------------------------------------------------------------------------------
-- RPCs
-------------------------------------------------------------------------------

-- Conflict-safe save for one documentation field. Runs as the caller, so RLS applies.
-- Returns { ok: true, field } or { ok: false, reason: 'conflict', field: <current row> }.
create or replace function public.save_field(
	p_product uuid,
	p_key text,
	p_value jsonb,
	p_evidence public.field_evidence,
	p_expected_version int
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
	r public.product_fields;
begin
	if not public.can_write_team(public.product_team(p_product)) then
		raise exception 'not allowed' using errcode = '42501';
	end if;

	if p_expected_version = 0 then
		insert into public.product_fields (product_id, field_key, value, evidence, version)
		values (p_product, p_key, p_value, p_evidence, 1)
		on conflict (product_id, field_key) do nothing
		returning * into r;
	else
		update public.product_fields
		set value = p_value, evidence = p_evidence, version = version + 1, updated_at = now()
		where product_id = p_product and field_key = p_key and version = p_expected_version
		returning * into r;
	end if;

	if r.id is not null then
		update public.products set updated_at = now() where id = p_product;
		return jsonb_build_object('ok', true, 'field', to_jsonb(r));
	end if;

	select * into r from public.product_fields where product_id = p_product and field_key = p_key;
	if r.id is null then
		-- Nothing written and nothing visible: caller lacks access (RLS) or the product doesn't exist.
		raise exception 'not allowed' using errcode = '42501';
	end if;
	return jsonb_build_object('ok', false, 'reason', 'conflict', 'field', to_jsonb(r));
end;
$$;

-- Teams flag a milestone as ready without being able to write review outcomes.
create or replace function public.mark_milestone_ready(p_milestone uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
	v_team uuid := public.my_team_id();
begin
	if v_team is null or not public.can_write_team(v_team) then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	if not exists (
		select 1 from public.milestones m join public.teams t on t.semester_id = m.semester_id
		where m.id = p_milestone and t.id = v_team
	) then
		raise exception 'milestone not in your semester' using errcode = '22023';
	end if;
	insert into public.milestone_reviews (milestone_id, team_id, status, ready_at)
	values (p_milestone, v_team, 'ready', now())
	on conflict (milestone_id, team_id) do update
		set status = 'ready', ready_at = now(), updated_at = now()
		where public.milestone_reviews.status in ('upcoming', 'follow-up');
end;
$$;

-- Ends every session for a user (used when rotating shared team credentials).
-- Only the service role (server-side admin actions) may call it.
create or replace function public.admin_revoke_sessions(p_user uuid) returns void
language sql security definer set search_path = '' as $$
	delete from auth.sessions where user_id = p_user;
$$;
revoke all on function public.admin_revoke_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_sessions(uuid) to service_role;

grant execute on function public.save_field(uuid, text, jsonb, public.field_evidence, int) to authenticated;
grant execute on function public.mark_milestone_ready(uuid) to authenticated;
revoke execute on function public.save_field(uuid, text, jsonb, public.field_evidence, int) from anon;
revoke execute on function public.mark_milestone_ready(uuid) from anon;
