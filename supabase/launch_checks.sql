-- LeadLoop launch verification queries.
-- Run in the Supabase SQL editor after applying schema.sql.

select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in ('agencies', 'profiles', 'staff_members', 'leads', 'lead_notes')
order by tablename;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('agencies', 'profiles', 'staff_members', 'leads', 'lead_notes')
order by tablename, policyname;

select
  trigger_name,
  event_object_schema,
  event_object_table,
  action_timing,
  event_manipulation
from information_schema.triggers
where event_object_schema in ('auth', 'public')
  and trigger_name in ('on_auth_user_created', 'leads_touch_updated_at')
order by trigger_name;

select
  table_schema,
  table_name,
  privilege_type,
  grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'intake_agencies'
order by grantee, privilege_type;
