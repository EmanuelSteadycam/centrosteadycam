import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PER_PAGE = 20;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const from = (page - 1) * PER_PAGE;
  const to   = from + PER_PAGE - 1;

  const supabase = createSupabaseServerClient();
  let q = supabase
    .from("archivio_items")
    .select(
      "id,titolo,natura,rete,anno,data_trasmissione,abstract,tags,codice_programma,is_fondamentale,image_url,target,programma_riferimento",
      { count: "exact" }
    );

  const query   = sp.get("q")?.trim();
  const natura  = sp.get("natura");
  const rete    = sp.get("rete");
  const anno    = sp.get("anno");
  const prog    = sp.get("programma");
  const target  = sp.get("target");
  const seq     = sp.get("sequenza");
  const t1      = sp.get("tematica1");
  const t2      = sp.get("tematica2");
  const t3      = sp.get("tematica3");

  if (query)        q = q.textSearch("fts", query, { type: "websearch", config: "italian" });
  if (natura)       q = q.eq("natura", natura);
  if (rete)         q = q.eq("rete", rete);
  if (anno)         q = q.eq("anno", parseInt(anno));
  if (prog)         q = q.eq("programma_riferimento", prog);
  if (target)       q = q.eq("target", target);
  if (seq === "1")  q = q.eq("is_sequenza", true);
  if (t1)           q = q.ilike("tags", `%${t1}%`);
  if (t2)           q = q.ilike("tags", `%${t2}%`);
  if (t3)           q = q.ilike("tags", `%${t3}%`);

  q = q.order("is_fondamentale", { ascending: false })
       .order("data_trasmissione", { ascending: false, nullsFirst: false })
       .range(from, to);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items:    data ?? [],
    total:    count ?? 0,
    page,
    hasMore:  (count ?? 0) > page * PER_PAGE,
  });
}
