-- "Le vostre storie" — storie degli ascoltatori del podcast e risposte, moderate prima della pubblicazione.
-- Una sola tabella: parent_id null = storia, parent_id valorizzato = risposta a quella storia.
-- is_staff = risposta del Centro Steadycam scritta dall'admin (pubblicata subito).
-- Letta e scritta solo lato server con service_role: niente accesso anon (contiene email e hash IP).

create table if not exists public.podcast_stories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.podcast_stories(id) on delete cascade,
  nome text not null,
  email text,
  titolo text,
  testo text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_staff boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists podcast_stories_parent_status_idx on public.podcast_stories (parent_id, status, created_at);
create index if not exists podcast_stories_ip_idx on public.podcast_stories (ip_hash, created_at);

alter table public.podcast_stories enable row level security;

grant select, insert, update, delete on public.podcast_stories to service_role;
