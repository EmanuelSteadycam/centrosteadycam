import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendPodcastStoryNotification } from "@/lib/brevo";
import { STORY_NAME_MAX_LENGTH, STORY_MAX_LENGTH, STORY_REPLY_MAX_LENGTH, STORY_TITLE_MAX_LENGTH } from "@/lib/podcast";

// Anti-spam: tempo minimo di compilazione, massimo N invii per IP nella finestra
const MIN_FILL_MS = 3000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function hashIp(ip: string): string {
  const salt = process.env.COMMENTS_IP_SALT ?? /* nome storico della variabile, se presente su Vercel */ process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(salt + ip).digest("hex");
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const parentId = str(body.parentId) || null;
  const nome = str(body.nome);
  const titolo = str(body.titolo);
  const testo = str(body.testo);
  const emailRaw = str(body.email);
  const honeypot = typeof body.website === "string" ? body.website : "";
  const startedAt = typeof body.t === "number" ? body.t : 0;

  // Bot: campo nascosto compilato o invio istantaneo → "ok" finto, nessun salvataggio
  if (honeypot || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const isReply = parentId !== null;
  const maxText = isReply ? STORY_REPLY_MAX_LENGTH : STORY_MAX_LENGTH;

  if (!nome || !testo || (!isReply && !titolo)) {
    return NextResponse.json(
      { error: isReply ? "Nome e risposta sono obbligatori" : "Nome, titolo e storia sono obbligatori" },
      { status: 400 }
    );
  }
  if (nome.length > STORY_NAME_MAX_LENGTH) {
    return NextResponse.json({ error: `Il nome può avere al massimo ${STORY_NAME_MAX_LENGTH} caratteri` }, { status: 400 });
  }
  if (!isReply && titolo.length > STORY_TITLE_MAX_LENGTH) {
    return NextResponse.json({ error: `Il titolo può avere al massimo ${STORY_TITLE_MAX_LENGTH} caratteri` }, { status: 400 });
  }
  if (testo.length > maxText) {
    return NextResponse.json({ error: `Il testo può avere al massimo ${maxText} caratteri` }, { status: 400 });
  }
  if (emailRaw && (emailRaw.length > 200 || !EMAIL_RE.test(emailRaw))) {
    return NextResponse.json({ error: "Indirizzo email non valido" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Si risponde solo a storie pubblicate (non a risposte, non a storie in attesa)
  let parentTitle: string | null = null;
  if (isReply) {
    if (!UUID_RE.test(parentId)) return NextResponse.json({ error: "Storia non disponibile" }, { status: 400 });
    const { data: parent } = await supabase
      .from("podcast_stories")
      .select("id, titolo, parent_id, status")
      .eq("id", parentId)
      .maybeSingle();
    if (!parent || parent.parent_id !== null || parent.status !== "approved") {
      return NextResponse.json({ error: "Storia non disponibile" }, { status: 400 });
    }
    parentTitle = parent.titolo ?? "";
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  const { count } = await supabase
    .from("podcast_stories")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - RATE_WINDOW_MS).toISOString());
  if ((count ?? 0) >= RATE_MAX) {
    return NextResponse.json({ error: "Hai inviato troppi messaggi, riprova tra qualche minuto" }, { status: 429 });
  }

  const { error } = await supabase.from("podcast_stories").insert({
    parent_id: parentId,
    nome,
    email: emailRaw || null,
    titolo: isReply ? null : titolo,
    testo,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("[podcast-storie] insert error:", error);
    return NextResponse.json({ error: "Errore nell'invio, riprova" }, { status: 500 });
  }

  try {
    await sendPodcastStoryNotification({
      nome,
      email: emailRaw || null,
      titolo: isReply ? null : titolo,
      testo,
      replyTo: parentTitle,
    });
  } catch (e) {
    console.error("[podcast-storie] notification error:", e);
  }

  return NextResponse.json({ ok: true });
}
