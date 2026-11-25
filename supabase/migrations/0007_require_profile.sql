-- Defense in depth: a Supabase Auth user without an active Studio profile (e.g. someone who called the
-- public sign-up API) can read nothing. Accounts are only provisioned by admins, who also create the profile.

create or replace function public.has_profile() returns boolean
language sql stable security definer set search_path = '' as $$
	select exists (select 1 from public.profiles where id = auth.uid() and active)
$$;

drop policy "read semesters" on public.semesters;
create policy "read semesters" on public.semesters for select to authenticated using (public.has_profile());

drop policy "read milestones" on public.milestones;
create policy "read milestones" on public.milestones for select to authenticated using (public.has_profile());

drop policy "read published lessons" on public.lessons;
create policy "read published lessons" on public.lessons for select to authenticated using ((published and public.has_profile()) or public.is_admin());

drop policy "read announcements" on public.announcements;
create policy "read announcements" on public.announcements for select to authenticated
	using ((published_at is not null and published_at <= now() and public.has_profile()) or public.is_admin());

drop policy "read published challenges" on public.challenges;
create policy "read published challenges" on public.challenges for select to authenticated using ((published and public.has_profile()) or public.is_admin());

drop policy "read resources" on public.resources;
create policy "read resources" on public.resources for select to authenticated
	using ((team_id is null and public.has_profile()) or (team_id is not null and public.can_read_team(team_id)));

drop policy "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select to authenticated
	using (
		id = auth.uid()
		or public.is_admin()
		or (role in ('mentor', 'admin') and public.has_profile())
		or exists (select 1 from public.teams t where t.account_profile_id = profiles.id and public.can_read_team(t.id))
	);
