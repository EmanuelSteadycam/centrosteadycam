import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ArchivioSearchForm from "./ArchivioSearchForm";
import ArchivioSearchBar from "./ArchivioSearchBar";
import ArchivioResults from "./ArchivioResults";

export const metadata: Metadata = {
  title: "Archivio — Centro Steadycam",
  description: "Oltre 34.119 schede di materiali audiovisivi raccolti tra il 2000 e il 2013.",
};

const PER_PAGE = 20;

type SearchParams = {
  q?: string; natura?: string; rete?: string; anno?: string; page?: string;
  programma?: string; target?: string; sequenza?: string;
  tematica1?: string; tematica2?: string; tematica3?: string;
};

// Opzioni statiche — archivio chiuso (2000-2013), non cambiano mai
const STATIC_OPTIONS = {
  reti: ['All Music','Archivio Steadycam','AXN','Baby Tv','Boing','Bonsai TV','CAN 5','Canal Jimmy','Cielo','Cine Movie','CineCinemas 1','CineCinemas 2','Cineclassic','Cinema Stream','Comedy Central','Comedy Life','Cult','Cult Network Italia','Current TV','DeAKids','Deejay Tv','Discovery Channel','Discovery Real Time','Disney Channel','Duel TV','Fantasy Channel','Fox','Fox Crime','Fox Life','FX','Gay Tv','GRP Televisione','GXT','Hallmark Channel','Happy Channel','History Channel','INN','Iris','ITA 1','La 5','La 7','La 7d','MATCH TV','Mediaset Extra','MGM Channel','MTV','MTV Brand:New','MTV Hits','MTV Music Television','National Geographic Channel','Odeon Tv','Planete','Qoob','RAI 1','RAI 2','RAI 3','RAI 4','Rai 5','Rai Doc','Rai Edu 1','Rai Edu 2','Rai Extra','Rai Futura','Rai Gulp','Rai International','Rai Med','Rai Movie','Rai News 24','Rai Premium','Rai Radio1','Rai Radio2','Rai Radio3','Rai Scuola','Rai Storia','Rai Utile','RaiSat Cinema','RaiSat Extra','RaiSat Fiction','RaiSat Ragazzi','RaiSat Show','RETE 4','Rete A','Rete7','Sala Video Canale','Sat 2000','Sky 16:9','Sky 2','Sky 827','Sky Autore','Sky Cinema 1','Sky Cinema Hits','Sky Cinema Italia','Sky Classic','Sky Comedy','Sky Family','Sky Mania','Sky Max','Sky Passion','Sky Show','Sky TG24','Sky TG24 Active','Sky Uno','Sky vivo','Studio Universal','Tele+ 16:9','Tele+ Bianco','Tele+ Grigio','Tele+ Nero','Telecupole','Telesubalpina','TMC','TMC2','TV2000'],
  nature: ['Cartone animato','Clip','Comic Show','Concerto','Cortometraggio',"Cortometraggio d'animazione",'Docufiction','Documentario','Fiction','Film',"Film d'animazione",'Game show','Inchiesta','Miscellanea','Montaggio Steadycam','Programma Musicale','Pubblicità','Rassegna di cortometraggi','Reality show','Sequenza','Servizio Informativo','Sitcom','Soap','Talent show','Talk show','Telefilm','Trailer','Varietà','Video'],
  targets: ['Adolescenti','Adolescenti e giovani','Adulti','Bambini','Bambini e adolescenti','Giovani','Giovani e adulti','Tutti'],
  programmi: ['1 x 1','10 Minuti','10 Minuti di..','10 of the Best','10 of the best - Staying alive','16 & Pregnant','19° Torino Film Festival','20 Anni prima','2000 Fatti e personaggi','25 a ORA','4° Piano scala a destra','51° Festival di Sanremo','52° Festival di Sanremo','53° Festival di Sanremo','54° Festival di Cannes','55° Festival di Cannes','56° Festival di Sanremo','80 Mania','90210','A night with...','A noi piace corto','A ruota libera','A sua immagine','Abbasso il Frollocone',"Abbicì l'ha detto la tivvù","Adolescenti: istruzioni per l'uso",'Affari Tuoi','Agenzia ADEE','Agorà','Agrodolce','Al posto tuo','Alice e le altre... Il paese delle meraviglie','Alice Nevers','Alle falde del Kilimangiaro','Altrevoci Diritti Negati','Altrove','American Dad!','Americana','Amici','Amici di Maria De Filippi','Amici per la pelle','Amore Criminale','Anni Luce','Anno Zero','Antonio e la banda dei giardinetti','Apprescindere','Appuntamento al cinema','Appuntamento con la musica','Around Midnight','Art News','Arthea','Articolotre','Asterics sottolinea...','Atlantide - Storie di uomini e di mondi','Avanzi','Avere 20 anni a...','Avere Ventanni','Baby-Gang','Ballarò','Barbareschi Sciock','Batti & Ribatti','Baywatch','Beavis & Butthead','Belli Dentro','Best Driver','Big Bang Theory','Bim bum bam','Bisturi - nessuno è perfetto','Blob','Blog - Reazioni a Catena','Blu Notte','Blue Bloods','Body Hits','Boris','Boston Public','Boys and girls','Bradipo','Brand New','Brand: New - WORLD AIDS DAY','Brava Giulia','Breaking Bad','Breaking Bad 2','Brigada','Brontolo','Buon Pomeriggio','Buona Domenica','Bye Bye Baby',"C'era una volta",'Caccia al Re','Californication','Camera Cafè','Cannes Cannes','Carabinieri','Carmencita','Cartoons Special','Casa e chiesa','Casa Raiuno','Casinò diaries','Castle','Caternoster','CD Live','Centovetrine','Che tempo che fa',"Chi l'ha visto?",'Chi vuol essere milionario','Chiamatemi Giò','Chiamatemi Giò 2','Chiambretti Night','Ciak junior','Ciak news','Ciao Darwin 4','Citizen Report','Città amara','Città criminali','City of men','CNN','CNN Live','Cocaine','Cocco Bill','Code Monkeys','Cold Case','Comici a pezzi','Cominciamo Bene','Cominciamo Bene Estate','Cominciamo Bene Prima','Community','Complotti','Comunicazione Sociale','Concerto del 1° maggio 2001','Concerto del 1° maggio 2003','Concerto del 1° maggio 2004','Concerto del 1° maggio 2005','Concerto del 1° maggio 2007','Continente Cina','Controcorrente','Controvento','Conversando',"Correva l'anno",'Corti di Cronaca','Corti Pixar','Corto 5','Corto Cult','Corto non solo','Cortometraggi','Cosmo','Così stanno le cose',"Così è la vita",'Coupling','Coyote','Crash - impatto, contatto, convivenza','Crash - la serie','Crea officina audiovisiva','Criminal Minds','Crimini 2','CSI: Miami','CSI: Scena del crimine','Cult Book','Cult Book - Storie','Cuork','Current Contrabbando','Current Doc','Dagli Appennini alle Ande','Dalla libertà alle dipendenze','Dammi il tempo','Dance floor chart','Daria',"Dawson's creek",'Delitti Rock','Dentro la musica','Dentro la notizia','Destinazione serie','Dexter','Diario di Classe','Diario di famiglia','Diary Of','Disco 2000','Dismissed','Disney Channel','Distretto di Polizia','Dixit','Doc 3','Doc Reportage','Documentari','Doc|Line','Dodicesimo Round','Domenica in','Domenica In Rosa','Don Matteo 2','Don Matteo 6','Don Matteo 8',"Don't miss it",'Donne','Dopo TG1','Dr House - Medical Division','Drawn Together','Dribbling','Drug Stories','Drug Wars','Drugline','E Cubo','E la chiamano Estate','E.T. Show','Earthlive','Economix','Effetto domino','Effetto Reale','Elisir','Enigma','ER - Medici in prima linea','Essere Indie','Euronews','European top 20','Eve e i Munchies','Eventi pop','Everwood','Excalibur','Exit - Uscita di Sicurezza','Explora','Explora on the road','Explora Scuola','Extra','Extreme Makeover','False identità','Festa italiana','Fiday Fever','Figu','Final 24','Fisica o Chimica','Focus Uno','Football Hooligans','Forum','Friends','Frontiere','Fuori Classe','Fuori di Zukka','Fuori Orario','Fur Tv','Gaia - Il pianeta che vive','Galatea','GAP - Generazioni alla prova','Gargantua','Gary & Mike','Gate C','Geek Files','Geek Rètro','Generazione','Generazione AK','Generazioni','Gente Cult','Gente di notte','Geo & Geo','Geo & Geo Magazine','Geronimo Stilton','Girl','Gli intoccabili',"Glob - L'osceno del villaggio",'Good as you','Gorgia: la retorica in TV','Gossip girl','Gotham','Grande Fratello 1','Grande Fratello 10','Grande Fratello 2','Grande Fratello 3','Grande Fratello 4','Grande Fratello 5','Grandi Domani','Greek','Happy days','Happy Tree Friends','Hip Hop Diaries','Hip Hop Generation','Hit List Italia','HJF','Homiez','Hotel Patria','Huff','I 50 anni del rock','I diari della Sacher','I fatti vostri','I film di diario','I Griffin','I Liceali','I Liceali 2','I Liceali 3','I nuovi Mille','I segreti di Twin Peaks','I Simpson','I soliti idioti','If you really knew me','Il Bivio','Il caffè di Corradino Mineo','Il Comandante Florent','Il commissario Rex','Il Contratto','Il fatto','Il fatto del giorno','Il grande talk','Il grande talk - decoder','Il grande talk cineforum','Il grillo','Il mestiere di vivere','Il più grande spettacolo dopo il weekend','Il raggio verde','Il rock sulla strada del cinema','Il senso della vita','Il Testimone','Il Tornasole','Imparare la tv','In 1/2 ora','In Italia','In onda','In Treatment','Incontri ravvicinati','Insieme sul Due','Insomnia','Internet Cafè','Into The Music','Invisibili','Invisibili 2a serie','Ippocrate','Italia allo specchio','Italia interroga','Italia sul 2','Italo-Francese','Italo-Spagnolo','Jackass','James Dean: una vita al limite','Julia - la strada per la felicità','Kebab for Breakfast','Kiss & Tell','Komitiva',"L'alieno","L'almanacco del Gene Gnocco","L'altra faccia del rock","L'elmo di scipio","L'elogio dell'imperfezione","L'enciclopedia della satira","L'era glaciale","L'Eredità","L'incudine","L'infedele","L'ispettore Derrick","L'Italia sul 2","L'Italia sul 2 - Giovani","L'ora Corta","L'uomo e le piante",'L33T','La Domenica Sportiva','La Grande Storia','La Grande Storia Magazine','La guerra infinita',"La linea d'ombra",'La lunga notte dei corti','La Mala EducaXXXion','La Melevisione','La Notte dei Pubblivori','La Nuova Squadra','La prova del cuoco','La Pupa e il Secchione','La rabbia giovane','La Scimmia','La Squadra','La Squadra 7','La storia siamo noi','La Superstoria','La valigia con lo spago','La vita in diretta','La vita secondo Jim','La vita segreta delle donne','Law & order','Le 7 età del rock','Le città invisibili','Le forme brevi della TV',"Le Forme dell'arte",'Le frontiere dello spirito','Le Iene','Le intervistone','Le Invasioni Barbariche','Le Luci di Brindisi','Le partite non finiscono mai','Le sfide di Nicky','Le Storie - Diario italiano','Le vite degli altri','Liberanti','Life as we know it','Life on Mars','Linea Blu','Linea Verde','Link','Live','Lo Spaccanoci','Lolle','Lorem Ipsum','Lost','Love Test','Loveline','Lucarelli racconta','Lucignolo','Lunapop live','Lunedì Doc','Mad four hits','Mad Men','Magazine sul 2','Magazzini Einstein','Mai dire Candid','Mai dire Grande Fratello Show','Mai dire Martedì','Making sense of the sixties','Making the video','Mala Vite','Malpensa Italia','Mamma dammi la benza',"Mamma ha preso l'aereo",'Mammamia','Mani sulla città','Maratona corti','Markette','Matricole & Meteore','Matrix','Mattina in Famiglia','Mattino Cinque','Maurizio Costanzo Show','Mediamente','Megalopolis','Metronapoli','Mettici la testa','Mi manda Raitre','Mille & una Italia','Millenium News','Millenium News Footlball Bus','Misfits','Miss Italia 2010',"Mission cartoline dall'inferno",'Mister Help',"Mitici '80",'Mondonair','Mono','Mosquito','Most Wanted','MTV Base','MTV Easy','MTV Flash','MTV Jammed','MTV Live','MTV Music Awards','MTV News','MTV Peace Week End','MTV Rochs','MTV Sonic','MTV Special Sunday','MTV Staying Alive','MTV Supersonic','Music Line','Music no stop','Musica','My compilation','Navigator','NCIS','Nessuno è perfetto','Niente di Personale','Night file','Nip/Tuck','No Borders','No excuse','Nobile Mobile','Non pensarci - la serie','Non perdiamoci di vista',"Non è m@i troppo tardi",'Nonsolomoda',"Notte prima degli esami '82",'Novecento','Nudi e crudi','Numb3rs','Occhio alla spesa','Odeon 2 - Tutto quanto fa spettacolo Sat','Off Hollywood','Okkupati','Oltremoda','Ombre sul giallo','Omnibus','Omnibus weekend','One Life','One Tree Hill','Operazione trionfo','Otto e mezzo','Padri & figli','Palco e retropalco','Paralleli','Parla con me','Paso Adelante','Passaggio a Nord Ovest','Passaparola','Passwor*d','Percorsi',"Percorsi d'amore",'Periferie','Piazza Grande','Piemonte Italia','Pioggia sporca','Playground','Pokermania','Polifemo','Pollicino','Pomeriggio Cinque','Popstar','Porta a porta','Premio Tenco','Presa diretta','PresaDiretta',"Presidenti d'Italia",'Profili','Pronto Elisir','Prossima Fermata','Pubblicità','Pubblicità - Carosello','Pugni in tasca','Pure Morning','Qoob Tv','Quelli che il calcio e...','Quello che.. Regioni','Questa Domenica','Racconti di vita','Racconti di vita - Sera',"Radici, l'altra faccia dell'immigrazione",'Radio active','Rai educational','Rai educational Mosaico per le scuole','Rai News 24','Rai Sport','RaiUtile Ambiente','RaiUtile Consumi','RaiUtile Famiglia','RaiUtile La Rosa di Gericho','RaiUtile Lavoro','Rapido tv.it','Reality','ReGenesis','Replay','Report','Res tore','Residence Bastoggi','Rete4 Cinefestival','Retrospettiva defa','Rewind','Rewind Studio Aperto','Ricomincio da qui','Ritratti','Road home','Rock & Altro','Rock in Rebibbia','Rock master',"Rock'n'Roll Evolution",'Rockpolitik','Rockumentary','Roma live','RT - Rotocalco Televisivo','S.O.S. Tata','Sabato Notte','Sabato, domenica e...','Safe Drive','Sai xchè?','SanRemo 09','Sanremo rock & trend','Sarabanda','Saranno Famosi','Satisfaction','Sbarre','Scalo 76','Scalo 76 - Cargo','Scarred','Sciuscià','Scorie','Screensaver','Screensaver estate','Scrittori per un anno','Scrubs, medici ai primi ferri','Scuola sotto esame','Secondo Voi','Select','Senza Fine','Serata Lost','Serata TG1','Settegiorni','Settimo Cielo','Sex 2k','Sfera','Sfide','Sfide Olimpiche','Sformat','Shameless','Shark - Giustizia a tutti i costi','Shout - urlatori','Simply the best','Sipario Notte','Skins','Skins 3','Skins 4','Skins 5','Skins US','Sky Lab Corto','Sky Speciale','SKY TG24','SKY TG24 Pomeriggio','Smackdown','Smallville','Social History Of','Sorgente di Vita','Sotto i cieli del mondo','Sottovoce','South Park','Spaghetti Family','Speciale','Speciale - Un mondo a colori','Speciale Brand new tour','Speciale Cinema','Speciale David Lynch','Speciale Donnie Darko','Speciale Europa','Speciale la storia siamo noi','Speciale Ligabue','Speciale No Mafie','Speciale Storie Maledette','Speciale Studio Aperto','Speciale TG1','Spottambuli','Stand Up','Standoff','Stasera che sera!','Staying Alive','Staying Alive Day','Stile','Storia della droga',"Storia proibita del '68",'Storie di confine','Storie di strada','Storie Italiane','Storie maledette','Stracult','Striscia la notizia','Studio Aperto','Successi','Sugo','Summer hits','Super','Superquark','Taboo','Tamarreide','Tatami','Teen Days','Telecamere','Telekommando','Telepatia','Tempi moderni',"Terapia d'urgenza",'Terra da musica','Terra!','Terzo Pianeta','Tetris','TG Com','TG La7','Tg Monitor','TG Oltre','TG1','Tg1 Focus Tendenze','TG1 Storie','Tg1 Teatro','Tg1/Fà la cosa giusta','TG2','TG2 Costume e Società','TG2 Dossier','TG2 Dossier Storie','TG2 Estate con costume','TG2 Medicina 33','TG2 Mizar','TG2 Net','TG2 Net Young','TG2 Punto.it','TG2 Salute','TG2 Storie - Racconti della settimana','TG3','TG3 - GT Ragazzi','TG3 Agenda del mondo','TG3 Agri 3','TG3 Chi è di scena','TG3 Cifre in chiaro','TG3 FuoriTG','TG3 Linea Notte','TG3 Persone','TG3 Pixel','TG3 Primo Piano','TG3 Punto Donna','TG3 Sabato Notte','TG3 Salute InForma','TG3 Scenari','TG3 Shukran','TG4','TG4 Rassegna stampa','TG5','TgN Telesubalpina','TGR Ambiente Italia','TGR Buongiorno Europa','TGR Buongiorno Regione','TGR Economia&Lavoro','TGR Estovest','TGR Europa','TGR I Nostri Soldi','TGR Il settimanale','TGR Italia Agricoltura','TGR Lazio','TGR Leonardo','TGR Levante','TGR Lombardia','TGR Mediterraneo','TGR Montagne','TGR Neapolis','TGR Piemonte','TGR Prodotto Italia','TGR RegionEuropa','The Boondocks','The Cleaner','The Cleaner 2','The Cleveland Show','The Drug Years','The Guardian','The Inbetweeners','The O.C.','The Oblongs','The one minutes jr.','The Qoob Show','The Riches','The Shield','The Soup','The vampire diaries','The weekend start here','The Who - Live at the Isle of Wight','The Wire','This World','Ti lascio una canzone','Timbuctu','Tinsel Town','Tintoria','Tintoria Show','TMC news','Tocca a noi','TOP 100 of 1995','TOP 100 of 1996','TOP 100 of 1997','TOP 100 of 1998','TOP 100 of 1999','TOP 100 of 2000','TOP 100 of 2001','TOP 100 of 2002','TOP 100 of 2003','TOP 100 of 2004','TOP 100 of 2005','Top 100 of the 2k','Top of the pops','Top Selection','Torino Film Festival','Tracy & Polpetta','Traffic - Miniserie','Trans - Europe','Transatlantico','Trebisonda','TRL','Trl Show','True Life','True Line','TSP - Conferenza Stampa','TSP - Messaggi autogestiti gratuiti','Tutte le mattine','Tutti pazzi per amore 2','Tutto benessere','Tutto in 1 notte','Tutto in Famiglia','Tutto in un giorno','Tv Talk','TV7','Uffa! che pazienza','Ugly Betty','Ulisse','Ultima leva','Uman Take Control!','Un caso di coscienza 4','Un giorno in pretura','Un giorno per caso','Un medico in famiglia 7','Un mondo a colori','Un mondo di amici','Un posto al sole','Underbelly','Underbelly 3','Underbelly Files','Underground','Universication','Uno spot per la vita','UnoMattina','UnoMattina Estate','Unplugged','Uomini e Donne','Vado a vivere da solo','Vanguard','VC 2','Verba Volant','Verissimo','Vertigo News','VictorVictoria','Videography','Vita in casa','Vita segreta di una teenager americana','Vite violate','Viva la crisi','Vivere','Vivere meglio','Viziati 2','Viziati 3','Voglia!','Voi... benessere','Voice','Volo in diretta',"Volti -Viaggio nel futuro d'Italia",'Vox Populi',"W L'Italia Diretta",'Wake Up','Weeds','Weeds 2','Weeds 3','Weeds 4','World Aids Day 2004','World Aids Day 2005','World Aids Day 2006','World Aids Day 2007','Wozzup','X Press','Your Noise','Zelig','Zelig Circus','Zelig Off',"È Solo Un Rock'n'Roll Show"],
};

async function fetchResults(sp: SearchParams) {
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PER_PAGE;
  const to   = from + PER_PAGE - 1;

  let q = supabase
    .from("archivio_items")
    .select(
      "id,titolo,natura,rete,anno,data_trasmissione,abstract,tags,codice_programma,is_fondamentale,image_url,target,programma_riferimento",
      { count: "exact" }
    );

  if (sp.q?.trim())        q = q.textSearch("fts", sp.q.trim(), { type: "websearch", config: "italian" });
  if (sp.natura)           q = q.eq("natura", sp.natura);
  if (sp.rete)             q = q.eq("rete", sp.rete);
  if (sp.anno)             q = q.eq("anno", parseInt(sp.anno));
  if (sp.programma)        q = q.eq("programma_riferimento", sp.programma);
  if (sp.target)           q = q.eq("target", sp.target);
  if (sp.sequenza === "1") q = q.eq("is_sequenza", true);
  if (sp.tematica1)       q = q.ilike("tags", `%${sp.tematica1}%`);
  if (sp.tematica2)       q = q.ilike("tags", `%${sp.tematica2}%`);
  if (sp.tematica3)       q = q.ilike("tags", `%${sp.tematica3}%`);

  q = q.order("is_fondamentale", { ascending: false })
       .order("data_trasmissione", { ascending: false, nullsFirst: false })
       .range(from, to);

  const { data, count, error } = await q;
  if (error) console.error("Archivio query error:", error);
  const total = count ?? 0;
  return { items: data ?? [], total, hasMore: total > PER_PAGE };
}

export default async function ArchivioPage({ searchParams }: { searchParams: SearchParams }) {
  const options = STATIC_OPTIONS;

  const hasFilters = !!(
    searchParams.q || searchParams.natura || searchParams.rete || searchParams.anno ||
    searchParams.programma || searchParams.target || searchParams.sequenza ||
    searchParams.tematica1 || searchParams.tematica2 || searchParams.tematica3
  );

  const { items, total, hasMore } = hasFilters
    ? await fetchResults(searchParams)
    : { items: [], total: 0, hasMore: false };

  return (
    <div className="min-h-screen bg-white">

      {/* Titolo + filtri */}
      <div className="px-12 pt-[160px] pb-0 bg-[#ede9f5]">
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-title font-semibold text-[#1e1e1e] uppercase tracking-[0.12em]"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            L&apos;ARCHIVIO STORICO
          </h1>
          <Link
            href="/archivio/approfondimenti"
            className="shrink-0 flex flex-col items-start gap-1 group mt-1"
          >
            <span className="font-title font-semibold text-[#7068a8] uppercase tracking-[0.1em] text-xs group-hover:text-[#5b4d8a] transition-colors">
              Archivio Approfondimenti →
            </span>
            <span className="text-[#7068a8]/70 text-xs" style={{ fontFamily: "var(--font-raleway)" }}>
              dal 2007 al 2017
            </span>
          </Link>
        </div>
        <p className="font-light text-black/50 mb-8" style={{ fontFamily: "var(--font-raleway)", fontSize: "15px" }}>
          Oltre 34.119 schede audiovisive raccolte tra il 2000 e il 2013
          {hasFilters && total > 0 && (
            <span className="text-black/70"> — <strong className="font-semibold">{total.toLocaleString("it-IT")}</strong> risultati</span>
          )}
        </p>
        <Suspense>
          <ArchivioSearchForm options={options} />
        </Suspense>

      </div>

      {/* Barra ricerca sticky — sotto i filtri, rimane visibile scorrendo i risultati */}
      <div className="sticky top-0 z-20 bg-[#ede9f5] border-b border-[#7068a8]/15 px-12 py-4">
        <Suspense>
          <ArchivioSearchBar />
        </Suspense>
      </div>

      {/* Risultati */}
      <div className="px-12 py-8">
        {!hasFilters ? null : items.length === 0 ? (
          <p className="font-light text-black/40 text-sm" style={{ fontFamily: "var(--font-raleway)" }}>
            Nessun risultato per questa ricerca.
          </p>
        ) : (
          <Suspense>
            <ArchivioResults initialItems={items} initialTotal={total} initialHasMore={hasMore} />
          </Suspense>
        )}
      </div>

      {/* Logo in fondo */}
      <div className="flex justify-center py-12">
        <img src="/CentroSteadycam_logo_old@2x.png" alt="Steadycam" className="h-[300px] w-auto opacity-60" />
      </div>
    </div>
  );
}
