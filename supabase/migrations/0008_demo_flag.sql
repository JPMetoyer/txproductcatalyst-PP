-- Marks rows created by `npm run demo:seed` so `npm run demo:reset` can remove exactly those rows
-- and nothing else. Everything a demo team owns hangs off a demo semester; demo accounts are
-- flagged on their profile; demo Career Center items are flagged on the resource.

alter table public.semesters add column if not exists demo boolean not null default false;
alter table public.profiles add column if not exists demo boolean not null default false;
alter table public.resources add column if not exists demo boolean not null default false;
