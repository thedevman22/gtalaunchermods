-- ModHarbor: per-user game setup (game_id + edition)

alter table public.profiles
  add column if not exists game_id text default 'gta5',
  add column if not exists game_edition text default 'legacy';
