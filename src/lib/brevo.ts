import {
  buildConfirmationHtml,
  buildApprovalHtml,
  buildRejectionHtml,
  buildReminderHtml,
} from "./mailup-html";

const API_KEY = process.env.BREVO_API_KEY!;
const BASE = "https://api.brevo.com/v3";
const SENDER = { name: "Centro Steadycam", email: "info@centrosteadycam.it" };
const DISPLAY_LIST_ID = 12;
const NEWSLETTER_LIST_ID = 3;

async function brevoPost(path: string, body: object) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo ${path}: ${res.status} — ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function sendMail({ to, subject, htmlBody }: { to: string; subject: string; htmlBody: string }) {
  await brevoPost("/smtp/email", {
    sender: SENDER,
    to: [{ email: to }],
    subject,
    htmlContent: htmlBody,
  });
  console.log(`[Brevo] sent to ${to}`);
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── notifica admin nuova iscrizione newsletter ────────────────────────────────
export async function sendNewsletterNotification(subscriber: { nome: string; email: string }) {
  const adminEmail = process.env.BREVO_ADMIN_EMAIL ?? "steadycam01@gmail.com";
  const now = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
  await sendMail({
    to: adminEmail,
    subject: `Steadynews — nuova iscrizione: ${subscriber.nome}`,
    htmlBody: `<p style="font-family:sans-serif;font-size:15px;">
      Nuova iscrizione alla Steadynews:<br><br>
      <strong>Nome:</strong> ${subscriber.nome}<br>
      <strong>Email:</strong> ${subscriber.email}<br>
      <strong>Data:</strong> ${now}
    </p>`,
  });
}

// ── aggiungi contatto al gruppo Newsletter ────────────────────────────────────
export async function addToNewsletterGroup(recipient: { email: string; nome: string }): Promise<number | null> {
  const res = await fetch(BASE + "/contacts", {
    method: "POST",
    headers: { "api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: recipient.email,
      attributes: { FIRSTNAME: recipient.nome },
      listIds: [NEWSLETTER_LIST_ID],
      updateEnabled: true,
    }),
  });

  console.log(`[Brevo addToNewsletter] status:${res.status}`);

  if (res.ok || res.status === 204) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : {};
    return body?.id ?? null;
  }

  const err = await res.text();
  console.error(`[Brevo addToNewsletter] failed:${res.status} — ${err}`);
  throw new Error(`Brevo newsletter failed: ${res.status}`);
}

// ── aggiungi contatto al gruppo Display ──────────────────────────────────────
export async function addToDisplayGroup(recipient: {
  email: string; nome: string; cognome: string; istituto: string;
}): Promise<number | null> {
  const res = await fetch(BASE + "/contacts", {
    method: "POST",
    headers: { "api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: recipient.email,
      attributes: {
        FIRSTNAME: recipient.nome,
        LASTNAME: recipient.cognome,
        COMPANY: recipient.istituto,
      },
      listIds: [DISPLAY_LIST_ID],
      updateEnabled: true,
    }),
  });

  console.log(`[Brevo addToDisplay] status:${res.status}`);

  if (res.ok || res.status === 204) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : {};
    return body?.id ?? null;
  }

  const err = await res.text();
  console.error(`[Brevo addToDisplay] failed:${res.status} — ${err}`);
  return null;
}

// ── rimuovi contatto dal gruppo Display ──────────────────────────────────────
export async function removeFromDisplayGroup(_email: string, _brevoId?: number | null) {
  if (!_email) return;
  const res = await fetch(BASE + `/contacts/lists/${DISPLAY_LIST_ID}/contacts/remove`, {
    method: "POST",
    headers: { "api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ emails: [_email] }),
  });
  console.log(`[Brevo removeFromDisplay] email:${_email} status:${res.status}`);
}

// ── 1. Conferma ricezione form ────────────────────────────────────────────────
export async function sendConfirmationEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
}) {
  await sendMail({
    to: booking.email,
    subject: "DISPLAY - abbiamo ricevuto la tua richiesta",
    htmlBody: buildConfirmationHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 2. Approvazione manuale ───────────────────────────────────────────────────
export async function sendApprovalEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
}) {
  await sendMail({
    to: booking.email,
    subject: "DISPLAY - la tua visita è confermata",
    htmlBody: buildApprovalHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 3. Rifiuto richiesta ──────────────────────────────────────────────────────
export async function sendRejectionEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; date: string;
}) {
  await sendMail({
    to: booking.email,
    subject: "DISPLAY - aggiornamento sulla tua richiesta",
    htmlBody: buildRejectionHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 4. Promemoria prima della visita ─────────────────────────────────────────
export async function sendReminderEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
  reminderDays: number;
}) {
  await sendMail({
    to: booking.email,
    subject: `DISPLAY - promemoria visita tra ${booking.reminderDays} giorni`,
    htmlBody: buildReminderHtml({ ...booking, date: formatDate(booking.date) }),
  });
}
