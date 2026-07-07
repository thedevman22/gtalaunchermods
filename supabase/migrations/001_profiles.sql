-- GTA Mod Launcher: profiles table and auth trigger
-- Run in Supabase SQL Editor or via `supabase db push`

create type public.subscription_tier as enum ('free', 'pro', 'elite');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  subscription_tier public.subscription_tier not null default 'free',
  role_badge text not null default 'Free Member',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, subscription_tier, role_badge)
  values (new.id, new.email, 'free', 'Free Member');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
