import {
  buildConfirmationHtml,
  buildApprovalHtml,
  buildRejectionHtml,
  buildReminderHtml,
} from "./mailup-html";

const TOKEN_URL = "https://services.mailup.com/Authorization/OAuth/Token";
const SEND_URL  = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/Email/Send";
const API_BASE  = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console";

// ── token cache ───────────────────────────────────────────────────────────
let _token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 60_000) return _token.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "password",
      client_id:     process.env.MAILUP_CLIENT_ID!,
      client_secret: process.env.MAILUP_CLIENT_SECRET!,
      username:      process.env.MAILUP_USERNAME!,
      password:      process.env.MAILUP_PASSWORD!,
    }),
  });

  if (!res.ok) throw new Error(`MailUp auth failed: ${res.status}`);
  const json = await res.json();
  _token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return _token.value;
}

// ── crea messaggio al volo e invia a singolo destinatario ─────────────────
async function sendMail({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}) {
  const token  = await getToken();
  const listId = Number(process.env.MAILUP_LIST_ID ?? "1");

  // 1. Crea il messaggio con HTML già popolato (nessuna sostituzione tag)
  const createRes = await fetch(`${API_BASE}/List/${listId}/Email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      Subject:        subject,
      Content:        htmlBody,
      Notes:          "Transactional — generato dal sito",
      SenderName:     process.env.MAILUP_SENDER_NAME  ?? "Centro Steadycam",
      SenderAddress:  process.env.MAILUP_SENDER_EMAIL ?? "",
      Embed:          false,
      IsConfirmation: false,
      TrackingInfo: {
        CustomParams: "",
        Enabled:      false,
        Protocols:    [],
        Domains:      [],
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`MailUp createMsg: ${createRes.status} — ${err}`);
  }

  const created = await createRes.json();
  const idMessage = typeof created === "number" ? created : created?.idMessage;
  console.log(`[MailUp] message created: id:${idMessage}`);

  // 2. Invia al destinatario
  const sendRes = await fetch(SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ Email: to, idMessage }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.text();
    throw new Error(`MailUp send: ${sendRes.status} — ${err}`);
  }

  console.log(`[MailUp] sent to ${to}`);
}

// ── helpers ───────────────────────────────────────────────────────────────
function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── aggiungi contatto al gruppo Display — ritorna idRecipient ─────────────
export async function addToDisplayGroup(recipient: {
  email: string; nome: string; cognome: string; istituto: string;
}): Promise<number | null> {
  const token   = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const res = await fetch(`${API_BASE}/Group/${groupId}/Recipient`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      Email: recipient.email,
      Name:  `${recipient.nome} ${recipient.cognome}`,
      Fields: [
        { Description: "FirstName", Id: 1, Value: recipient.nome },
        { Description: "LastName",  Id: 2, Value: recipient.cognome },
        { Description: "Display_Istituto_Scolastico", Id: 29, Value: recipient.istituto },
      ],
    }),
  });

  console.log(`[MailUp addToGroup] status:${res.status}`);

  if (res.ok) {
    const body = await res.json();
    console.log(`[MailUp addToGroup] body:${JSON.stringify(body)}`);
    return typeof body === "number" ? body : (body?.idRecipient ?? null);
  }

  const err = await res.text();
  console.error(`[MailUp addToGroup] failed:${res.status} — ${err}`);
  return null;
}

// ── rimuovi contatto dal gruppo Display ───────────────────────────────────
export async function removeFromDisplayGroup(
  _email: string,
  mailupId?: number | null
) {
  if (!mailupId) return;
  const token   = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const res = await fetch(`${API_BASE}/Group/${groupId}/Unsubscribe/${mailupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`[MailUp removeFromGroup] id:${mailupId} status:${res.status}`);
}

// ── 1. Conferma ricezione form ─────────────────────────────────────────────
export async function sendConfirmationEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
}) {
  await sendMail({
    to:       booking.email,
    subject:  "DISPLAY - abbiamo ricevuto la tua richiesta",
    htmlBody: buildConfirmationHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 2. Approvazione manuale ────────────────────────────────────────────────
export async function sendApprovalEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
}) {
  await sendMail({
    to:       booking.email,
    subject:  "DISPLAY - la tua visita è confermata",
    htmlBody: buildApprovalHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 3. Rifiuto richiesta ───────────────────────────────────────────────────
export async function sendRejectionEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; date: string;
}) {
  await sendMail({
    to:       booking.email,
    subject:  "DISPLAY - aggiornamento sulla tua richiesta",
    htmlBody: buildRejectionHtml({ ...booking, date: formatDate(booking.date) }),
  });
}

// ── 4. Promemoria prima della visita ──────────────────────────────────────
export async function sendReminderEmail(booking: {
  nome: string; cognome: string; email: string; istituto: string;
  classe: string; n_alunni: number; n_adulti: number; date: string;
  reminderDays: number;
}) {
  await sendMail({
    to:       booking.email,
    subject:  `DISPLAY - promemoria visita tra ${booking.reminderDays} giorni`,
    htmlBody: buildReminderHtml({ ...booking, date: formatDate(booking.date) }),
  });
}
