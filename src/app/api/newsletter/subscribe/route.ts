import { NextRequest, NextResponse } from "next/server";
import { addToNewsletterGroup, sendNewsletterNotification } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  const { nome, email } = await req.json();

  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nome ed email obbligatori" }, { status: 400 });
  }

  try {
    await addToNewsletterGroup({ nome: nome.trim(), email: email.trim() });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err);
    return NextResponse.json({ error: "Errore iscrizione" }, { status: 500 });
  }

  // notifica admin — attesa (su serverless il fire-and-forget rischia di essere
  // interrotto a metà quando la risposta parte prima che l'invio finisca), ma
  // un suo fallimento non deve far fallire l'iscrizione già andata a buon fine
  try {
    await sendNewsletterNotification({ nome: nome.trim(), email: email.trim() });
  } catch (e) {
    console.error("[newsletter] notification error:", e);
  }

  return NextResponse.json({ ok: true });
}
