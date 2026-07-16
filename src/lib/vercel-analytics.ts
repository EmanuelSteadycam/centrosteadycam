const TEAM_ID = "team_3RVObwIunRvaN4Qr5ZFL9xa9";
const PROJECT_ID = "prj_6trIlDB7CI4hKjP2kwnlG8ihaQh9";
const BASE = "https://api.vercel.com";

async function vaGet(path: string, params: Record<string, string>) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN not set");

  const qs = new URLSearchParams({
    teamId: TEAM_ID,
    projectId: PROJECT_ID,
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
  topPages: { route: string; views: number }[];
};

export async function getVercelAnalytics(days = 30): Promise<VercelAnalyticsSummary> {
  const until = Date.now();
  const since = until - days * 86400 * 1000;
  const p = { since: String(since), until: String(until) };

  const [countData, byDayData, topPagesData] = await Promise.all([
    vaGet("/v1/query/web-analytics/visits/count", p),
    vaGet("/v1/query/web-analytics/visits/aggregate", { ...p, by: "day", limit: "30" }),
    vaGet("/v1/query/web-analytics/visits/aggregate", { ...p, by: "route", limit: "10" }),
  ]);

  const totalViews: number = countData?.data?.visits ?? 0;
  const totalVisitors: number = countData?.data?.visitors ?? 0;

  const byDay: VercelAnalyticsSummary["byDay"] = (byDayData?.data ?? []).map((row: Record<string, unknown>) => ({
    timestamp: String(row.timestamp ?? row.day ?? ""),
    views: Number(row.visits ?? row.pageviews ?? row.count ?? 0),
    visitors: Number(row.visitors ?? row.uniqueVisitors ?? 0),
  }));

  const topPages: VercelAnalyticsSummary["topPages"] = (topPagesData?.data ?? []).map((row: Record<string, unknown>) => ({
    route: String(row.route ?? row.requestPath ?? row.path ?? ""),
    views: Number(row.visits ?? row.pageviews ?? row.count ?? 0),
  }));

  return { totalViews, totalVisitors, byDay, topPages };
}
