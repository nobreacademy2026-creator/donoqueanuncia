-- Create roles enum if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end $$;

-- Ensure user_roles table exists
create table if not exists public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Grant access to user_roles
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Drop and recreate the has_role function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Ensure RLS and Grants on analytics_events
grant select, insert on public.analytics_events to authenticated;
grant insert on public.analytics_events to anon;
grant all on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

-- Policy for admins to read all events
drop policy if exists "Admins can select all events" on public.analytics_events;
create policy "Admins can select all events"
on public.analytics_events
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy for everyone to insert events
drop policy if exists "Anyone can insert events" on public.analytics_events;
create policy "Anyone can insert events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

-- Ensure quiz_config has correct grants
grant select on public.quiz_config to anon, authenticated;
grant all on public.quiz_config to service_role;

-- Ensure the current user has the admin role if they are authenticated
-- This is a helper to make sure the user doesn't get locked out during development
insert into public.user_roles (user_id, role)
select auth.uid(), 'admin'::public.app_role
from auth.users
where auth.uid() is not null
on conflict (user_id, role) do nothing;
