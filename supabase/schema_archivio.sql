-- Archivio Steadycam — 34.119 schede audiovisive (2000-2013)
-- Generato da scripts/migrate-archivio.py

create table if not exists archivio_items (
  id                  bigserial primary key,
  id_originale        integer unique,
  titolo              text,
  natura              text,          -- tipo contenuto (Film, Documentario, ecc.)
  rete                text,          -- canale TV
  data_trasmissione   date,
  anno                integer,
  autore              text,
  produzione          text,
  interpreti          text,
  abstract            text,
  tags                text,          -- parole chiave separate da virgola
  dvd                 text,
  cassetta            text,
  is_fondamentale     boolean default false,
  streaming_url       text,
  -- full-text search vector (italiano)
  fts tsvector generated always as (
    to_tsvector('italian',
      coalesce(titolo,'') || ' ' ||
      coalesce(abstract,'') || ' ' ||
      coalesce(tags,'') || ' ' ||
      coalesce(autore,'') || ' ' ||
      coalesce(natura,'') || ' ' ||
      coalesce(rete,'')
    )
  ) stored
);

create index if not exists archivio_fts_idx   on archivio_items using gin(fts);
create index if not exists archivio_natura_idx on archivio_items(natura);
create index if not exists archivio_rete_idx   on archivio_items(rete);
create index if not exists archivio_anno_idx   on archivio_items(anno);
create index if not exists archivio_fond_idx   on archivio_items(is_fondamentale);
