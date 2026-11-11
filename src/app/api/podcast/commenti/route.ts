import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendPodcastCommentNotification } from "@/lib/brevo";
import { COMMENT_MAX_LENGTH, COMMENT_NAME_MAX_LENGTH } from "@/lib/podcast";

// Anti-spam: compilazione più rapida di così = bot; massimo N invii per IP nella finestra
const MIN_FILL_MS = 3000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashIp(ip: string): string {
  const salt = process.env.COMMENTS_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(salt + ip).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const episodeId = typeof body.episodeId === "string" ? body.episodeId : "";
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const testo = typeof body.testo === "string" ? body.testo.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const honeypot = typeof body.website === "string" ? body.website : "";
  const startedAt = typeof body.t === "number" ? body.t : 0;

  // Bot: campo nascosto compilato o invio istantaneo → risposta "ok" finta, nessun salvataggio
  if (honeypot || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  if (!episodeId || !nome || !testo) {
    return NextResponse.json({ error: "Nome e commento sono obbligatori" }, { status: 400 });
  }
  if (nome.length > COMMENT_NAME_MAX_LENGTH) {
    return NextResponse.json({ error: `Il nome può avere al massimo ${COMMENT_NAME_MAX_LENGTH} caratteri` }, { status: 400 });
  }
  if (testo.length > COMMENT_MAX_LENGTH) {
    return NextResponse.json({ error: `Il commento può avere al massimo ${COMMENT_MAX_LENGTH} caratteri` }, { status: 400 });
  }
  if (emailRaw && (emailRaw.length > 200 || !EMAIL_RE.test(emailRaw))) {
    return NextResponse.json({ error: "Indirizzo email non valido" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Si commentano solo puntate esistenti e già uscite
  const { data: episode } = await supabase
    .from("podcast_episodes")
    .select("id, number, title, release_at")
    .eq("id", episodeId)
    .maybeSingle();
  if (!episode || new Date(episode.release_at).getTime() > Date.now()) {
    return NextResponse.json({ error: "Episodio non disponibile" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  const { count } = await supabase
    .from("podcast_comments")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - RATE_WINDOW_MS).toISOString());
  if ((count ?? 0) >= RATE_MAX) {
    return NextResponse.json({ error: "Hai inviato troppi commenti, riprova tra qualche minuto" }, { status: 429 });
  }

  const { error } = await supabase.from("podcast_comments").insert({
    episode_id: episode.id,
    nome,
    email: emailRaw || null,
    testo,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("[podcast-commenti] insert error:", error);
    return NextResponse.json({ error: "Errore nell'invio, riprova" }, { status: 500 });
  }

  // Notifica admin: attesa ma non bloccante (vedi newsletter/subscribe)
  try {
    await sendPodcastCommentNotification({
      nome,
      email: emailRaw || null,
      testo,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
    });
  } catch (e) {
    console.error("[podcast-commenti] notification error:", e);
  }

  return NextResponse.json({ ok: true });
}
