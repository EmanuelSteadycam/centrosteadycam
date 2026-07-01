import { NextRequest, NextResponse } from "next/server";
import { addToNewsletterGroup, sendNewsletterNotification } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  const { nome, email } = await req.json();

  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nome ed email obbligatori" }, { status: 400 });
  }

  try {
    await addToNewsletterGroup({ nome: nome.trim(), email: email.trim() });
    // notifica admin — fire-and-forget (non blocca la risposta)
    sendNewsletterNotification({ nome: nome.trim(), email: email.trim() }).catch(
      (e) => console.error("[newsletter] notification error:", e)
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err);
    return NextResponse.json({ error: "Errore iscrizione" }, { status: 500 });
  }
}
