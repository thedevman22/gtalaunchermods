-- Allow clients to insert their own profile row if the auth trigger did not run yet.
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
