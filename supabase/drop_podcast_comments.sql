-- Rimozione dei commenti per puntata (sostituiti da "Le vostre storie", 2026-11-16).
-- Cancella la tabella e tutti i commenti vecchi. Da eseguire nel SQL Editor DOPO il deploy del codice che non la usa più.
drop table if exists public.podcast_comments;
