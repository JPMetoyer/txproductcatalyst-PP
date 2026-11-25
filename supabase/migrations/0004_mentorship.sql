-- Phase 3: comment threads, support flags, phase tracking, team renaming, one active semester.

-------------------------------------------------------------------------------
-- Comment threads (one level of replies) with resolve / reopen history
-------------------------------------------------------------------------------
alter table public.field_comments
	add column parent_id uuid references public.field_comments (id) on delete cascade,
	add column resolved_by uuid references public.profiles (id) on delete set null,
	add column resolved_at timestamptz;
create index on public.field_comments (parent_id);

-- A reply must point at a top-level comment on the same product + field.
create or replace function public.comment_parent_ok(p_parent uuid, p_product uuid, p_field text) returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (
		select 1 from public.field_comments c
		where c.id = p_parent and c.parent_id is null and c.product_id = p_product and c.field_key = p_field
	)
$$;

drop policy "mentor or admin comments" on public.field_comments;
drop policy "edit own comments" on public.field_comments;

-- Mentors (assigned) and admins start threads; the team can reply to existing threads.
create policy "write comments" on public.field_comments for insert to authenticated
	with check (
		author_profile_id = auth.uid()
		and resolved = false
		and (parent_id is null or public.comment_parent_ok(parent_id, product_id, field_key))
		and (
			public.is_admin()
			or public.mentors_team(public.product_team(product_id))
			or (parent_id is not null and public.can_write_team(public.product_team(product_id)))
		)
	);
-- Authors may edit their own text; resolution goes through set_comment_resolved() below.
create policy "edit own comments" on public.field_comments for update to authenticated
	using (author_profile_id = auth.uid()) with check (author_profile_id = auth.uid());
revoke update on public.field_comments from authenticated;
grant update (body) on public.field_comments to authenticated;

-- Team, assigned mentors, and admins can resolve or reopen a thread.
create or replace function public.set_comment_resolved(p_comment uuid, p_resolved boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
	v_product uuid;
	v_parent uuid;
	v_team uuid;
begin
	select product_id, parent_id into v_product, v_parent from public.field_comments where id = p_comment;
	if v_product is null then
		raise exception 'comment not found' using errcode = 'P0002';
	end if;
	if v_parent is not null then
		raise exception 'resolve the thread, not a reply' using errcode = '22023';
	end if;
	v_team := public.product_team(v_product);
	if not (public.is_admin() or public.mentors_team(v_team) or public.can_write_team(v_team)) then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	update public.field_comments
	set resolved = p_resolved,
		resolved_by = case when p_resolved then auth.uid() end,
		resolved_at = case when p_resolved then now() end
	where id = p_comment;
end;
$$;
grant execute on function public.set_comment_resolved(uuid, boolean) to authenticated;
revoke execute on function public.set_comment_resolved(uuid, boolean) from anon;

-- Names on comments: mentors/admins are visible to everyone signed in; team accounts are visible to
-- whoever can read that team (its mentors), so replies show the team's name.
drop policy "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select to authenticated
	using (
		id = auth.uid()
		or public.is_admin()
		or role in ('mentor', 'admin')
		or exists (select 1 from public.teams t where t.account_profile_id = profiles.id and public.can_read_team(t.id))
	);

-------------------------------------------------------------------------------
-- Support flags (mentor → Academics), cleared by admins
-------------------------------------------------------------------------------
alter table public.milestone_reviews drop column flagged;

create table public.team_flags (
	id uuid primary key default gen_random_uuid(),
	team_id uuid not null references public.teams (id) on delete cascade,
	reason text not null check (length(trim(reason)) between 3 and 1000),
	flagged_by uuid references public.profiles (id) on delete set null,
	created_at timestamptz not null default now(),
	cleared_by uuid references public.profiles (id) on delete set null,
	cleared_at timestamptz,
	clear_note text not null default ''
);
create index on public.team_flags (team_id) where cleared_at is null;
alter table public.team_flags enable row level security;

create policy "read flags" on public.team_flags for select to authenticated
	using (public.is_admin() or public.mentors_team(team_id));
create policy "raise flags" on public.team_flags for insert to authenticated
	with check (flagged_by = auth.uid() and cleared_at is null and (public.is_admin() or public.mentors_team(team_id)));
create policy "admins clear flags" on public.team_flags for update to authenticated
	using (public.is_admin()) with check (public.is_admin());
grant select, insert, update on public.team_flags to authenticated;
grant all on public.team_flags to service_role;

-------------------------------------------------------------------------------
-- Phase tracking: mentors (assigned) and admins set a team's actual phase.
-- The calendar-recommended phase is computed in the app from published GM dates.
-------------------------------------------------------------------------------
create or replace function public.set_team_phase(p_team uuid, p_phase public.journey_phase) returns void
language plpgsql security definer set search_path = '' as $$
begin
	if not (public.is_admin() or public.mentors_team(p_team)) then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	update public.teams set current_phase = p_phase where id = p_team;
end;
$$;
grant execute on function public.set_team_phase(uuid, public.journey_phase) to authenticated;
revoke execute on function public.set_team_phase(uuid, public.journey_phase) from anon;

-------------------------------------------------------------------------------
-- Teams rename themselves. Only the display name changes: IDs, login and documentation stay put.
-------------------------------------------------------------------------------
create or replace function public.rename_my_team(p_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare
	v_team uuid := public.my_team_id();
	v_name text := trim(p_name);
begin
	if v_team is null or not public.can_write_team(v_team) then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	if length(v_name) < 2 or length(v_name) > 80 then
		raise exception 'Team name must be 2–80 characters' using errcode = '22023';
	end if;
	update public.teams set name = v_name where id = v_team;
end;
$$;
grant execute on function public.rename_my_team(text) to authenticated;
revoke execute on function public.rename_my_team(text) from anon;

-------------------------------------------------------------------------------
-- Exactly one active semester at a time (pages look up "the" active semester).
-------------------------------------------------------------------------------
create unique index one_active_semester on public.semesters ((true)) where status = 'active';
