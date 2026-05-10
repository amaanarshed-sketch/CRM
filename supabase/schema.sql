create extension if not exists "pgcrypto";

do $$
begin
  create type public.pipeline_stage as enum (
    'New',
    'Contacted',
    'Follow-up Due',
    'Interested',
    'Appointment Scheduled',
    'Proposal Sent',
    'Won',
    'Lost',
    'Stale'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_status as enum (
    'Not requested',
    'Requested',
    'Partial',
    'Complete',
    'Missing'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stale_threshold_days integer not null default 7 check (stale_threshold_days > 0),
  default_follow_up_days integer not null default 2 check (default_follow_up_days > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  company text,
  source text,
  job_interest text,
  location text,
  assigned_staff text,
  stage public.pipeline_stage not null default 'New',
  last_contacted_date date,
  next_follow_up_date date,
  document_status public.document_status not null default 'Not requested',
  notes text,
  experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_agency_id_idx on public.profiles (agency_id);
create index if not exists staff_members_agency_id_idx on public.staff_members (agency_id);
create index if not exists leads_agency_id_idx on public.leads (agency_id);
create index if not exists leads_follow_up_idx on public.leads (agency_id, next_follow_up_date);
create index if not exists leads_stage_idx on public.leads (agency_id, stage);
create index if not exists lead_notes_agency_id_idx on public.lead_notes (agency_id);

create or replace view public.intake_agencies as
select id, name, created_at
from public.agencies;

grant select on public.intake_agencies to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row execute function public.touch_updated_at();

create or replace function public.current_agency_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agency_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_agency_id uuid;
  agency_name text;
  profile_name text;
begin
  agency_name := coalesce(new.raw_user_meta_data->>'agency_name', 'New Workspace');
  profile_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.agencies (name)
  values (agency_name)
  returning id into new_agency_id;

  insert into public.profiles (id, agency_id, full_name, email)
  values (new.id, new_agency_id, profile_name, new.email);

  insert into public.staff_members (agency_id, name, email)
  values (new_agency_id, profile_name, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.staff_members enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

drop policy if exists "Users can read own agency" on public.agencies;
drop policy if exists "Users can update own agency" on public.agencies;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Agency scoped staff read" on public.staff_members;
drop policy if exists "Agency scoped staff write" on public.staff_members;
drop policy if exists "Agency scoped leads read" on public.leads;
drop policy if exists "Agency scoped leads write" on public.leads;
drop policy if exists "Workspace scoped leads read" on public.leads;
drop policy if exists "Workspace scoped leads write" on public.leads;
drop policy if exists "Public intake can create new leads" on public.leads;
drop policy if exists "Agency scoped notes read" on public.lead_notes;
drop policy if exists "Agency scoped notes write" on public.lead_notes;

create policy "Users can read own agency"
on public.agencies for select
using (id = public.current_agency_id());

create policy "Users can update own agency"
on public.agencies for update
using (id = public.current_agency_id())
with check (id = public.current_agency_id());

create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid() or agency_id = public.current_agency_id());

create policy "Agency scoped staff read"
on public.staff_members for select
using (agency_id = public.current_agency_id());

create policy "Agency scoped staff write"
on public.staff_members for all
using (agency_id = public.current_agency_id())
with check (agency_id = public.current_agency_id());

create policy "Workspace scoped leads read"
on public.leads for select
using (agency_id = public.current_agency_id());

create policy "Workspace scoped leads write"
on public.leads for all
using (agency_id = public.current_agency_id())
with check (agency_id = public.current_agency_id());

create policy "Public intake can create new leads"
on public.leads for insert
to anon
with check (
  stage = 'New'
  and source = 'Public intake form'
  and document_status = 'Not requested'
);

create policy "Agency scoped notes read"
on public.lead_notes for select
using (agency_id = public.current_agency_id());

create policy "Agency scoped notes write"
on public.lead_notes for all
using (agency_id = public.current_agency_id())
with check (agency_id = public.current_agency_id());
