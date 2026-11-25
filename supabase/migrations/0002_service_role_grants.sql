-- This project doesn't auto-expose new tables to the API roles, so grant explicitly.
-- service_role is the server-side admin key (bypasses RLS); used by admin actions and the seed script.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Future tables/functions created by migrations get the same service_role access automatically.
-- (anon/authenticated grants stay explicit in each migration, next to that table's RLS policies.)
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
