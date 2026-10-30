-- SkillGraph Phase 1: identity, preferences, goals, RLS, profile bootstrap.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  preferred_name text,
  location text,
  educational_background text,
  current_situation text,
  preferred_language text not null default 'en',
  onboarding_completed_at timestamptz,
  onboarding_step integer not null default 0,
  is_admin boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  interests text[] not null default '{}',
  experience_categories text[] not null default '{}',
  marketing_email_opt_in boolean not null default false,
  ai_processing_opt_in boolean not null default true,
  model_training_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  target_occupation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_goals_user_id_idx on public.user_goals (user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists user_goals_set_updated_at on public.user_goals;
create trigger user_goals_set_updated_at
before update on public.user_goals
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, preferred_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'preferred_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_goals enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "preferences_select_own" on public.user_preferences;
create policy "preferences_select_own"
on public.user_preferences for select
using (auth.uid() = user_id);

drop policy if exists "preferences_update_own" on public.user_preferences;
create policy "preferences_update_own"
on public.user_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_select_own" on public.user_goals;
create policy "goals_select_own"
on public.user_goals for select
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.user_goals;
create policy "goals_insert_own"
on public.user_goals for insert
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.user_goals;
create policy "goals_update_own"
on public.user_goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.user_goals;
create policy "goals_delete_own"
on public.user_goals for delete
using (auth.uid() = user_id);
