const TOKEN_URL = "https://services.mailup.com/Authorization/OAuth/Token";
const SEND_URL =
  "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/Email/Send";
const API_BASE = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console";

// In-memory token cache
let _token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 60_000) return _token.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: process.env.MAILUP_CLIENT_ID!,
      client_secret: process.env.MAILUP_CLIENT_SECRET!,
      username: process.env.MAILUP_USERNAME!,
      password: process.env.MAILUP_PASSWORD!,
    }),
  });

  if (!res.ok) throw new Error(`MailUp auth failed: ${res.status}`);
  const json = await res.json();
  _token = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return _token.value;
}

type Field = { Description: string; Value: string };

async function sendMail({
  to,
  idMessage,
  fields,
}: {
  to: string;
  idMessage: number;
  fields: Field[];
}) {
  const token = await getToken();
  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      Email: to,
      idMessage,
      Fields: fields,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MailUp send failed: ${res.status} — ${err}`);
  }
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Aggiungi contatto al gruppo Display (upsert) ──────────────────────────
export async function addToDisplayGroup(recipient: {
  email: string;
  nome: string;
  cognome: string;
  istituto: string;
}) {
  const token = await getToken();
  const listId = Number(process.env.MAILUP_LIST_ID ?? "1");
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  // Cerca se il contatto esiste già nella lista
  const searchRes = await fetch(
    `${API_BASE}/List/${listId}/Recipients/EmailOptins?pageSize=1&pageNumber=1&filterby="Email='${recipient.email}'"`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = searchRes.ok ? await searchRes.json() : null;
  const existing = searchData?.Items?.[0];

  if (existing?.idRecipient) {
    await fetch(`${API_BASE}/Group/${groupId}/Recipient`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ idRecipient: existing.idRecipient }),
    });
  } else {
    await fetch(`${API_BASE}/Group/${groupId}/Recipient`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        Email: recipient.email,
        Name: `${recipient.nome} ${recipient.cognome}`,
        Fields: [
          { Description: "Nome", Id: 1, Value: recipient.nome },
          { Description: "Cognome", Id: 2, Value: recipient.cognome },
          { Description: "Istituto", Id: 3, Value: recipient.istituto },
        ],
      }),
    });
  }
}

// ── Rimuovi contatto dal gruppo Display ───────────────────────────────────
export async function removeFromDisplayGroup(email: string) {
  const token = await getToken();
  const listId = Number(process.env.MAILUP_LIST_ID ?? "1");
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const searchRes = await fetch(
    `${API_BASE}/List/${listId}/Recipients/EmailOptins?pageSize=1&pageNumber=1&filterby="Email='${email}'"`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = searchRes.ok ? await searchRes.json() : null;
  const existing = searchData?.Items?.[0];

  if (existing?.idRecipient) {
    await fetch(`${API_BASE}/Group/${groupId}/Recipient/${existing.idRecipient}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

// ── 1. Conferma ricezione form ─────────────────────────────────────────────
export async function sendConfirmationEmail(booking: {
  nome: string;
  cognome: string;
  email: string;
  istituto: string;
  classe: string;
  n_alunni: number;
  n_adulti: number;
  date: string;
}) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_CONFIRMATION ?? "60"),
    fields: [
      { Description: "nome", Value: booking.nome },
      { Description: "cognome", Value: booking.cognome },
      { Description: "data", Value: formatDate(booking.date) },
      { Description: "istituto", Value: booking.istituto },
      { Description: "classe", Value: booking.classe },
      { Description: "partecipanti", Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
    ],
  });
}

// ── 2. Approvazione manuale ────────────────────────────────────────────────
export async function sendApprovalEmail(booking: {
  nome: string;
  cognome: string;
  email: string;
  istituto: string;
  classe: string;
  n_alunni: number;
  n_adulti: number;
  date: string;
}) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_APPROVAL ?? "59"),
    fields: [
      { Description: "nome", Value: booking.nome },
      { Description: "cognome", Value: booking.cognome },
      { Description: "data", Value: formatDate(booking.date) },
      { Description: "istituto", Value: booking.istituto },
      { Description: "classe", Value: booking.classe },
      { Description: "partecipanti", Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
    ],
  });
}

// ── 3. Rifiuto richiesta ───────────────────────────────────────────────────
export async function sendRejectionEmail(booking: {
  nome: string;
  cognome: string;
  email: string;
  istituto: string;
  classe: string;
  date: string;
}) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_REJECTION ?? "58"),
    fields: [
      { Description: "nome", Value: booking.nome },
      { Description: "cognome", Value: booking.cognome },
      { Description: "data", Value: formatDate(booking.date) },
      { Description: "istituto", Value: booking.istituto },
      { Description: "classe", Value: booking.classe },
    ],
  });
}

// ── 4. Promemoria prima della visita ──────────────────────────────────────
export async function sendReminderEmail(booking: {
  nome: string;
  cognome: string;
  email: string;
  istituto: string;
  classe: string;
  n_alunni: number;
  n_adulti: number;
  date: string;
  reminderDays: number;
}) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_REMINDER ?? "57"),
    fields: [
      { Description: "nome", Value: booking.nome },
      { Description: "cognome", Value: booking.cognome },
      { Description: "data", Value: formatDate(booking.date) },
      { Description: "istituto", Value: booking.istituto },
      { Description: "classe", Value: booking.classe },
      { Description: "partecipanti", Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
      { Description: "giorni", Value: String(booking.reminderDays) },
    ],
  });
}
