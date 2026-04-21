import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PER_PAGE = 20;

export async function GET(req: NextRequest) {
  const sp   = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const from = (page - 1) * PER_PAGE;
  const to   = from + PER_PAGE - 1;

  const supabase = createSupabaseServerClient();
  let q = supabase
    .from("approfondimenti")
    .select("id,id_originale,titolo,data,estratto,image_url", { count: "exact" });

  const query = sp.get("q")?.trim();
  if (query) q = q.textSearch("fts", query, { type: "websearch", config: "italian" });

  q = q.order("data", { ascending: false, nullsFirst: false }).range(from, to);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items:   data ?? [],
    total:   count ?? 0,
    page,
    hasMore: (count ?? 0) > page * PER_PAGE,
  });
}
