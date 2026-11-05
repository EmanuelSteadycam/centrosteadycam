-- Podcast "Addomesticare gli schermi" — pagina /addomesticareglischermi + /admin/podcast
-- Da eseguire nel SQL Editor di Supabase.

create table if not exists public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  title text not null default '',
  description text not null default '',
  cover_url text,
  release_at timestamptz not null,
  spotify_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.podcast_settings (
  key text primary key,
  value text not null default ''
);

insert into public.podcast_settings (key, value) values
  ('spotify_show_url', ''),
  ('intro', '')
on conflict (key) do nothing;

alter table public.podcast_episodes enable row level security;
alter table public.podcast_settings enable row level security;

create policy "podcast_episodes lettura pubblica" on public.podcast_episodes for select using (true);
create policy "podcast_settings lettura pubblica" on public.podcast_settings for select using (true);

grant select, insert, update, delete on public.podcast_episodes to service_role;
grant select, insert, update, delete on public.podcast_settings to service_role;
grant select on public.podcast_episodes to anon;
grant select on public.podcast_settings to anon;
