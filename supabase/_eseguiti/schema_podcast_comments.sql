-- Commenti alle puntate del podcast — moderati prima della pubblicazione.
-- Eseguito nel SQL Editor di Supabase il 2026-11-11.
-- Letti e scritti solo lato server con service_role: niente accesso anon
-- (la tabella contiene email e hash IP che non devono mai uscire).

create table if not exists public.podcast_comments (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.podcast_episodes(id) on delete cascade,
  nome text not null,
  email text,
  testo text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reply text,
  reply_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists podcast_comments_episode_status_idx on public.podcast_comments (episode_id, status, created_at);
create index if not exists podcast_comments_ip_idx on public.podcast_comments (ip_hash, created_at);

alter table public.podcast_comments enable row level security;

grant select, insert, update, delete on public.podcast_comments to service_role;
