-- For accounts with no team (mentors, admins), `p_team = my_team_id()` is NULL, not false.
-- RLS treats NULL as "deny" so data was never exposed, but `IF NOT <null>` in save_field didn't
-- raise, so a mentor's save was reported as a "conflict" instead of "not allowed".
-- Make every helper return a definite true/false.

create or replace function public.can_read_team(p_team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select coalesce(
		public.is_admin() or p_team = public.my_team_id() or public.mentors_team(p_team),
		false
	)
$$;

create or replace function public.can_write_team(p_team uuid) returns boolean
language sql stable security definer set search_path = '' as $$
	select coalesce(
		public.is_admin() or (
			p_team = public.my_team_id()
			and exists (select 1 from public.teams where id = p_team and status = 'active')
		),
		false
	)
$$;
