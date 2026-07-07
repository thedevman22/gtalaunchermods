-- User mod library sync + profile preferences

create table if not exists public.user_mods (
  user_id uuid not null references auth.users (id) on delete cascade,
  mod_id text not null,
  enabled boolean not null default false,
  installed_at timestamptz not null default now(),
  primary key (user_id, mod_id)
);

create index if not exists user_mods_user_id_idx on public.user_mods (user_id);

alter table public.user_mods enable row level security;

create policy "Users can read own mods"
  on public.user_mods
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own mods"
  on public.user_mods
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mods"
  on public.user_mods
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own mods"
  on public.user_mods
  for delete
  using (auth.uid() = user_id);

alter table public.profiles
  add column if not exists sync_preferences_enabled boolean not null default false,
  add column if not exists theme_preference text not null default 'dark',
  add column if not exists default_install_path text;
