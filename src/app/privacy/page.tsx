import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali del Centro Steadycam.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16 prose prose-lg">
        <p>
          Questa informativa privacy descrive come il Centro Steadycam (ASL CN2) raccoglie, utilizza
          e protegge i dati personali degli utenti che visitano il sito web.
        </p>
        <h2>Titolare del trattamento</h2>
        <p>
          Centro Steadycam — ASL CN2<br />
          C.so Michele Coppino 46/A, 12051 Alba (CN)<br />
          Email: info@progettosteadycam.it
        </p>
        <h2>Dati raccolti</h2>
        <p>
          Il sito raccoglie solo i dati forniti volontariamente dall&apos;utente tramite il modulo
          di prenotazione: nome, cognome, email, telefono, istituto scolastico.
        </p>
        <h2>Finalità</h2>
        <p>I dati sono utilizzati esclusivamente per la gestione delle prenotazioni delle visite al Centro Display.</p>
        <h2>Conservazione</h2>
        <p>I dati sono conservati per il tempo strettamente necessario al completamento della prenotazione.</p>
        <h2>Le vostre storie (podcast)</h2>
        <p>
          Chi racconta una storia o risponde a una storia nella sezione &ldquo;Le vostre storie&rdquo; della
          pagina del podcast &ldquo;Addomesticare gli schermi&rdquo; fornisce un nome o uno pseudonimo, il
          testo (e, per le storie, un titolo) e, facoltativamente, un indirizzo email. Nome, titolo e testo
          vengono pubblicati solo dopo la lettura e l&apos;approvazione della redazione, che può non
          pubblicare i contenuti contenenti dati che permettano di identificare l&apos;autore o altre
          persone, in particolare minori. L&apos;indirizzo email non viene mai pubblicato e serve soltanto
          per un&apos;eventuale risposta privata. Per prevenire lo spam l&apos;indirizzo IP viene registrato
          esclusivamente in forma cifrata e non reversibile. Storie e risposte restano pubblicate finché
          l&apos;autore non ne chiede la rimozione.
        </p>
        <h2>Diritti dell&apos;interessato</h2>
        <p>
          Gli utenti possono esercitare i diritti previsti dal GDPR (accesso, rettifica, cancellazione)
          scrivendo a info@progettosteadycam.it.
        </p>
      </div>
    </div>
  );
}
