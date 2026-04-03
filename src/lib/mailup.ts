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

type Field = { Id: number; Description: string; Value: string };

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

// ── Cerca idRecipient per email ───────────────────────────────────────────
async function findRecipientId(token: string, email: string): Promise<number | null> {
  const listId = Number(process.env.MAILUP_LIST_ID ?? "1");
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  // Cerca in EmailOptins e EmailOptouts (contatto potrebbe essere non confermato)
  for (const status of ["EmailOptins", "EmailOptouts"]) {
    const res = await fetch(
      `${API_BASE}/List/${listId}/Recipients/${status}?pageSize=1&pageNumber=1&filterby="Email='${email}'"`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = res.ok ? await res.json() : null;
    console.log(`[MailUp find] ${status} → ${res.status} items:${data?.Items?.length ?? "err"} id:${data?.Items?.[0]?.idRecipient ?? "none"}`);
    const id = data?.Items?.[0]?.idRecipient;
    if (id) return id;
  }

  return null;
}

// ── Aggiungi contatto al gruppo Display — ritorna idRecipient ─────────────
export async function addToDisplayGroup(recipient: {
  email: string;
  nome: string;
  cognome: string;
  istituto: string;
}): Promise<number | null> {
  const token = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const existingId = await findRecipientId(token, recipient.email);

  const res = await fetch(`${API_BASE}/Group/${groupId}/Recipient`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: existingId
      ? JSON.stringify({ idRecipient: existingId })
      : JSON.stringify({
          Email: recipient.email,
          Name: `${recipient.nome} ${recipient.cognome}`,
          Fields: [
            { Description: "nome",    Id: 1, Value: recipient.nome },
            { Description: "cognome", Id: 2, Value: recipient.cognome },
            { Description: "Display_Istituto_Scolastico", Id: 29, Value: recipient.istituto },
          ],
        }),
  });

  if (res.ok) {
    const body = await res.json();
    // MailUp ritorna l'idRecipient come numero intero nella risposta
    const returnedId = typeof body === "number" ? body : body?.idRecipient ?? null;
    return returnedId ?? existingId ?? null;
  }
  return existingId ?? null;
}

// ── Rimuovi contatto dal gruppo Display ───────────────────────────────────
export async function removeFromDisplayGroup(
  email: string,
  mailupId?: number | null
) {
  const token = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  // Usa l'ID salvato in DB se disponibile, altrimenti cerca
  const idRecipient = mailupId ?? (await findRecipientId(token, email));
  if (!idRecipient) return;

  await fetch(`${API_BASE}/Group/${groupId}/Recipient/${idRecipient}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
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
      { Id: 1,  Description: "nome",    Value: booking.nome },
      { Id: 2,  Description: "cognome", Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
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
      { Id: 1,  Description: "nome",    Value: booking.nome },
      { Id: 2,  Description: "cognome", Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
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
      { Id: 1,  Description: "nome",    Value: booking.nome },
      { Id: 2,  Description: "cognome", Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
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
      { Id: 1,  Description: "nome",    Value: booking.nome },
      { Id: 2,  Description: "cognome", Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
      { Id: 32, Description: "Display_giorni_reminder",    Value: String(booking.reminderDays) },
    ],
  });
}
