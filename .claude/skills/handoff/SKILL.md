---
name: handoff
description: Genera o aggiorna HANDOFF.md nella root del progetto con un riassunto in prosa della sessione corrente — cosa è stato fatto, stato attuale, decisioni prese, problemi aperti, prossimi passi. Usare quando l'utente chiude la sessione o invoca esplicitamente /handoff.
---

# /handoff

Genera (o aggiorna) `HANDOFF.md` nella root del progetto `centrosteadycam`, riassumendo la sessione di lavoro corrente per chi la riprenderà — che sia l'utente stesso più tardi, o un'istanza futura di Claude senza memoria di questa conversazione.

## Regola vincolante (non negoziabile)

Non presentare mai come fatto accertato qualcosa che non è stato verificato con una prova diretta in questa sessione (comando eseguito e il suo output, screenshot controllato, test riprodotto, misurazione via JS nel browser, ecc.). Se un dettaglio è plausibile ma non controllato — un numero di riga, se un fix è stato ri-verificato dopo l'ultima modifica, se un comportamento corrisponde davvero al sito di riferimento — scrivilo esplicitamente come "non verificato" o "ipotesi non confermata". Non riempire un buco di conoscenza con una spiegazione plausibile scritta con lo stesso tono di un fatto confermato. Questa regola vale per tutto il contenuto di HANDOFF.md, senza eccezioni.

## Passi

1. **Raccogli lo stato reale del repository**, non fidarti della memoria della conversazione per queste cose — esegui e leggi l'output di:
   - `git status`
   - `git diff --stat` (e il diff completo se non è enorme, per capire davvero cosa è cambiato riga per riga)
   - `git log --oneline -10`
   Questi comandi sono la fonte di verità su cosa è effettivamente nel working tree, non quello che si "ricorda" di aver fatto.

2. **Controlla se esiste già un `HANDOFF.md`** nella root. Se esiste, leggilo prima di sovrascriverlo: potrebbe contenere note di una sessione precedente ancora rilevanti (problemi aperti non risolti, decisioni pregresse) che vanno preservate o esplicitamente aggiornate/superate, non perse silenziosamente.

3. **Ricostruisci dalla conversazione corrente**, con lo stesso rigore:
   - Cosa l'utente ha chiesto e perché (se il motivo è stato dichiarato).
   - Cosa è stato effettivamente fatto, distinguendo chiaramente tra "modificato nel codice" e "modificato E verificato funzionante" — sono cose diverse, non confonderle.
   - Le decisioni prese durante la sessione e la ragione dichiarata (es. scelte tra approcci alternativi, cose scartate e perché).
   - Bug o problemi trovati ma non ancora risolti, con lo stato esatto in cui sono stati lasciati.
   - Eventuali affermazioni fatte durante la sessione che poi si sono rivelate sbagliate o premature — vanno riportate come lezione/contesto utile, non nascoste.

4. **Scrivi `HANDOFF.md`** in prosa scorrevole (paragrafi, non solo elenchi puntati — gli elenchi puntati vanno bene per i "prossimi passi" ma il resto deve leggersi come una spiegazione a una persona, non come un changelog compresso). Struttura suggerita, adattabile:
   - **Cosa è successo in questa sessione** — narrativa di cosa si è lavorato, in ordine.
   - **Stato attuale esatto** — cosa funziona (con che prova), cosa è stato modificato ma non ri-verificato dopo l'ultima modifica, cosa è ancora rotto.
   - **Decisioni prese e perché**.
   - **Problemi aperti / blocchi** — inclusi eventuali dubbi non risolti (es. "non è chiaro se X corrisponda al comportamento del sito originale, da verificare").
   - **Prossimi passi concreti** — cosa fare alla ripresa, in ordine di priorità se possibile.

5. **Lingua**: italiano, coerente con il resto del progetto e con come lavora l'utente.

6. Al termine, conferma all'utente il percorso del file scritto e un riepilogo di una o due frasi — non ripetere l'intero contenuto in chat.
