-- Azzera il campo programma_riferimento (dati errati — tb_programma_di_riferimento mancante)
UPDATE archivio_items SET programma_riferimento = NULL WHERE programma_riferimento IS NOT NULL;
