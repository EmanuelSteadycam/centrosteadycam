-- con_statistiche = false (tutti i record non marcati true)
UPDATE archivio_items SET con_statistiche = false WHERE con_statistiche IS NULL;
