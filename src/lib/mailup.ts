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

// ── Aggiorna profilo destinatario prima dell'invio ─────────────────────────
async function updateRecipientFields(
  token: string,
  idRecipient: number,
  fields: Field[]
): Promise<void> {
  const listId = Number(process.env.MAILUP_LIST_ID ?? "1");
  const res = await fetch(`${API_BASE}/List/${listId}/Recipient/${idRecipient}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idRecipient, Fields: fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[MailUp] updateRecipientFields failed: ${res.status} — ${err}`);
  } else {
    console.log(`[MailUp] updateRecipientFields ok: id:${idRecipient}`);
  }
}

async function sendMail({
  to,
  idMessage,
  fields,
  mailupId,
}: {
  to: string;
  idMessage: number;
  fields: Field[];
  mailupId?: number | null;
}) {
  const token = await getToken();

  // Aggiorna il profilo con i campi specifici della prenotazione
  // così i tag [FirstName], [Display_Data_iscrizione] ecc. vengono sostituiti
  if (mailupId) {
    await updateRecipientFields(token, mailupId, fields);
  }

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


// ── Aggiungi contatto al gruppo Display — ritorna idRecipient ─────────────
// MailUp fa upsert per email: se il contatto esiste già (in qualsiasi lista/gruppo),
// aggiorna il profilo e lo aggiunge al gruppo, restituendo l'idRecipient esistente.
export async function addToDisplayGroup(recipient: {
  email: string;
  nome: string;
  cognome: string;
  istituto: string;
}): Promise<number | null> {
  const token = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const res = await fetch(`${API_BASE}/Group/${groupId}/Recipient`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      Email: recipient.email,
      Name: `${recipient.nome} ${recipient.cognome}`,
      Fields: [
        { Description: "FirstName", Id: 1, Value: recipient.nome },
        { Description: "LastName",  Id: 2, Value: recipient.cognome },
        { Description: "Display_Istituto_Scolastico", Id: 29, Value: recipient.istituto },
      ],
    }),
  });

  console.log(`[MailUp addToGroup] status: ${res.status}`);

  if (res.ok) {
    const body = await res.json();
    console.log(`[MailUp addToGroup] body: ${JSON.stringify(body)}`);
    // MailUp ritorna l'idRecipient come numero intero nella risposta
    return typeof body === "number" ? body : (body?.idRecipient ?? null);
  }

  const err = await res.text();
  console.error(`[MailUp addToGroup] failed: ${res.status} — ${err}`);
  return null;
}

// ── Rimuovi contatto dal gruppo Display ───────────────────────────────────
export async function removeFromDisplayGroup(
  _email: string,
  mailupId?: number | null
) {
  if (!mailupId) return;

  const token = await getToken();
  const groupId = Number(process.env.MAILUP_DISPLAY_GROUP_ID ?? "23");

  const res = await fetch(`${API_BASE}/Group/${groupId}/Recipient/${mailupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`[MailUp removeFromGroup] id:${mailupId} status:${res.status}`);
}

// ── 1. Conferma ricezione form ─────────────────────────────────────────────
export async function sendConfirmationEmail(
  booking: {
    nome: string;
    cognome: string;
    email: string;
    istituto: string;
    classe: string;
    n_alunni: number;
    n_adulti: number;
    date: string;
  },
  mailupId?: number | null
) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_CONFIRMATION ?? "60"),
    mailupId,
    fields: [
      { Id: 1,  Description: "FirstName", Value: booking.nome },
      { Id: 2,  Description: "LastName",  Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
    ],
  });
}

// ── 2. Approvazione manuale ────────────────────────────────────────────────
export async function sendApprovalEmail(
  booking: {
    nome: string;
    cognome: string;
    email: string;
    istituto: string;
    classe: string;
    n_alunni: number;
    n_adulti: number;
    date: string;
  },
  mailupId?: number | null
) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_APPROVAL ?? "59"),
    mailupId,
    fields: [
      { Id: 1,  Description: "FirstName", Value: booking.nome },
      { Id: 2,  Description: "LastName",  Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
    ],
  });
}

// ── 3. Rifiuto richiesta ───────────────────────────────────────────────────
export async function sendRejectionEmail(
  booking: {
    nome: string;
    cognome: string;
    email: string;
    istituto: string;
    classe: string;
    date: string;
  },
  mailupId?: number | null
) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_REJECTION ?? "58"),
    mailupId,
    fields: [
      { Id: 1,  Description: "FirstName", Value: booking.nome },
      { Id: 2,  Description: "LastName",  Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
    ],
  });
}

// ── 4. Promemoria prima della visita ──────────────────────────────────────
export async function sendReminderEmail(
  booking: {
    nome: string;
    cognome: string;
    email: string;
    istituto: string;
    classe: string;
    n_alunni: number;
    n_adulti: number;
    date: string;
    reminderDays: number;
  },
  mailupId?: number | null
) {
  await sendMail({
    to: booking.email,
    idMessage: Number(process.env.MAILUP_MSG_REMINDER ?? "57"),
    mailupId,
    fields: [
      { Id: 1,  Description: "FirstName", Value: booking.nome },
      { Id: 2,  Description: "LastName",  Value: booking.cognome },
      { Id: 28, Description: "Display_Data_iscrizione",    Value: formatDate(booking.date) },
      { Id: 29, Description: "Display_Istituto_Scolastico", Value: booking.istituto },
      { Id: 30, Description: "Display_Classe",             Value: booking.classe },
      { Id: 31, Description: "Display_partecipanti",       Value: `${booking.n_alunni} alunni + ${booking.n_adulti} adulti` },
      { Id: 32, Description: "Display_giorni_reminder",    Value: String(booking.reminderDays) },
    ],
  });
}
