-- Phase 3 (part B): content management.

-- Semesters can be prepared before they start: upcoming → active → archived.
alter type public.semester_status add value if not exists 'upcoming' before 'active';

-- Reordering GMs swaps their numbers, which needs the uniqueness check deferred to commit.
alter table public.lessons drop constraint lessons_semester_id_gm_number_key;
alter table public.lessons add constraint lessons_semester_gm_unique unique (semester_id, gm_number) deferrable initially immediate;

create or replace function public.admin_swap_lessons(p_a uuid, p_b uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare
	na int;
	nb int;
begin
	if not public.is_admin() then
		raise exception 'not allowed' using errcode = '42501';
	end if;
	set constraints public.lessons_semester_gm_unique deferred;
	select gm_number into na from public.lessons where id = p_a;
	select gm_number into nb from public.lessons where id = p_b;
	if na is null or nb is null then
		raise exception 'lesson not found' using errcode = 'P0002';
	end if;
	update public.lessons set gm_number = nb where id = p_a;
	update public.lessons set gm_number = na where id = p_b;
end;
$$;
grant execute on function public.admin_swap_lessons(uuid, uuid) to authenticated;
revoke execute on function public.admin_swap_lessons(uuid, uuid) from anon;
