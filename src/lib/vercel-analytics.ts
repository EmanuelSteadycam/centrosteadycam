import { getBrevoRecentCampaigns } from "./brevo";

const TEAM_ID = "team_3RVObwIunRvaN4Qr5ZFL9xa9";
const PROJECT_ID = "prj_6trIlDB7CI4hKjP2kwnlG8ihaQh9";
const BASE = "https://api.vercel.com";

// Esclude il traffico verso il pannello admin (noi che lavoriamo sul sito) dalle metriche pubbliche.
//
// Esclude anche due pagine con un picco di ~500 visite concentrato tutto nel giorno 16/07/2026
// (invio della newsletter #37 "Skillati per la rete"), referrer sempre vuoto, ~55 "visitatori"
// identici su entrambe: non sono letture reali ma scanner di sicurezza email (Microsoft Safe
// Links e simili, comuni nelle reti scolastiche) che aprono in automatico ogni link contenuto
// nella mail. Stesso fenomeno dei click gonfiati osservato su Brevo per la stessa campagna.
// Se in futuro queste pagine iniziano ad avere traffico reale, andrà tolta l'esclusione
// (o resa specifica per intervallo di date) per non nascondere letture genuine.
const EXCLUDE_FILTER =
  "not startswith(requestPath, '/admin') " +
  "and requestPath ne '/blog/il-corpo-e-la-macchina' " +
  "and requestPath ne '/blog/la-patente-per-lo-smartphone'";

// Voci da nascondere dall'elenco "Pagine più visitate" (link rotti/vecchi o bucket non utili)
const HIDDEN_PAGES = ["Others", "/blog/aiuto", "/category/blog", "/gaming-e-benessere"];

async function vaGet(path: string, params: Record<string, string>) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN not set");

  const qs = new URLSearchParams({
    teamId: TEAM_ID,
    projectId: PROJECT_ID,
    filter: EXCLUDE_FILTER,
    ...params,
  });
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error.message ?? data.error.code);
  return data;
}

export type VercelAnalyticsSummary = {
  totalViews: number;
  totalVisitors: number;
  byDay: { timestamp: string; views: number; visitors: number }[];
  topPages: { route: string; views: number; suspicious: boolean }[];
};

// Quante ore dopo l'invio di una campagna Brevo si osserva tipicamente il picco di scanner
// di sicurezza email (di solito ore, non giorni — 48h dà margine)
const CAMPAIGN_BURST_WINDOW_H = 48;
// Entro quanti giorni una campagna è considerata "recente" ai fini del controllo
const RECENT_CAMPAIGN_DAYS = 5;
// Sopra questa quota di visite concentrate nella finestra la pagina viene segnalata come sospetta
const SUSPICIOUS_RATIO = 0.8;

/**
 * Per ogni campagna Brevo inviata di recente, controlla quali pagine hanno ricevuto la
 * maggior parte delle loro visite (30gg) proprio nelle ore successive all'invio — segnale
 * tipico di scanner di sicurezza email che seguono automaticamente i link (anche quelli
 * raggiungibili di rimbalzo, es. dalla sezione "articoli recenti" della pagina linkata),
 * non di lettori reali. Non nasconde nulla: restituisce solo l'elenco dei path sospetti,
 * così il widget può segnalarli invece di far sparire in automatico dati potenzialmente veri.
 */
async function findSuspiciousPaths(topPages: { route: string; views: number }[]): Promise<Set<string>> {
  const suspicious = new Set<string>();
  if (topPages.length === 0) return suspicious;

  let campaigns: { sentDate: string | null; status: string }[] = [];
  try {
    campaigns = await getBrevoRecentCampaigns(5);
  } catch {
    return suspicious; // Brevo non raggiungibile: nessun controllo, nessun falso positivo
  }

  const cutoff = Date.now() - RECENT_CAMPAIGN_DAYS * 86400 * 1000;
  const recentSends = campaigns
    .filter((c) => c.status === "sent" && c.sentDate && new Date(c.sentDate).getTime() > cutoff)
    .map((c) => new Date(c.sentDate as string).getTime());

  for (const sentAt of recentSends) {
    const burstData = await vaGet("/v1/query/web-analytics/visits/aggregate", {
      since: String(sentAt),
      until: String(sentAt + CAMPAIGN_BURST_WINDOW_H * 3600 * 1000),
      by: "requestPath",
      limit: "20",
    });
    const burstRows: { requestPath?: string; pageviews?: number }[] = burstData?.data ?? [];
    const burstByPath = new Map(burstRows.map((r) => [String(r.requestPath ?? ""), Number(r.pageviews ?? 0)]));

    for (const page of topPages) {
      const burstViews = burstByPath.get(page.route) ?? 0;
      if (page.views > 3 && burstViews / page.views >= SUSPICIOUS_RATIO) {
        suspicious.add(page.route);
      }
    }
  }

  return suspicious;
}

export async function getVercelAnalytics(days = 30): Promise<VercelAnalyticsSummary> {
  const until = Date.now();
  const since = until - days * 86400 * 1000;
  const p = { since: String(since), until: String(until) };

  const [countData, byDayData, topPagesData] = await Promise.all([
    vaGet("/v1/query/web-analytics/visits/count", p),
    vaGet("/v1/query/web-analytics/visits/aggregate", { ...p, by: "day", limit: "30" }),
    // requestPath = percorso esatto (ogni articolo separato), a differenza di "route" che
    // raggruppa tutti gli articoli sotto il pattern generico /blog/[slug]
    // limit più alto del necessario: dopo aver tolto HIDDEN_PAGES restano comunque 10 voci
    vaGet("/v1/query/web-analytics/visits/aggregate", { ...p, by: "requestPath", limit: "20" }),
  ]);

  const totalViews: number = countData?.data?.pageviews ?? 0;
  const totalVisitors: number = countData?.data?.visitors ?? 0;

  const byDay: VercelAnalyticsSummary["byDay"] = (byDayData?.data ?? []).map((row: Record<string, unknown>) => ({
    timestamp: String(row.timestamp ?? ""),
    views: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
  }));

  const rawTopPages = (topPagesData?.data ?? [])
    .map((row: Record<string, unknown>) => ({
      route: String(row.requestPath ?? ""),
      views: Number(row.pageviews ?? 0),
    }))
    .filter((page: { route: string; views: number }) => !HIDDEN_PAGES.includes(page.route))
    .slice(0, 10);

  const suspiciousPaths = await findSuspiciousPaths(rawTopPages);
  const topPages: VercelAnalyticsSummary["topPages"] = rawTopPages.map((page: { route: string; views: number }) => ({
    ...page,
    suspicious: suspiciousPaths.has(page.route),
  }));

  return { totalViews, totalVisitors, byDay, topPages };
}
