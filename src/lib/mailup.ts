const TOKEN_URL = "https://services.mailup.com/Authorization/OAuth/Token";
const SEND_URL =
  "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/Email/Send";

// In-memory token cache (resets on server restart, fine for serverless)
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

async function sendMail({
  to,
  toName,
  subject,
  html,
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}) {
  const token = await getToken();
  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      Html: { Body: html },
      Text: { Body: html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() },
      idList: Number(process.env.MAILUP_LIST_ID ?? "1"),
      Subject: subject,
      Recipient: { Email: to, Name: toName, idRecipient: 0 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MailUp send failed: ${res.status} — ${err}`);
  }
}

// ── HTML wrapper ──────────────────────────────────────────────────────────────
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:580px;">
        <tr>
          <td style="background:#0D1117;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#88BF81;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">Centro Steadycam</p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Display Techno</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;color:#333333;font-size:15px;line-height:1.7;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
            <p style="margin:0;color:#999999;font-size:11px;">Centro Steadycam · <a href="https://centrosteadycam.it" style="color:#88BF81;text-decoration:none;">centrosteadycam.it</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px;font-size:13px;color:#666666;white-space:nowrap;">${label}</td>
    <td style="padding:6px 12px;font-size:14px;color:#222222;font-weight:bold;">${value}</td>
  </tr>`;
}

function detailTable(rows: Array<[string, string]>): string {
  return `<table cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:6px;border:1px solid #eeeeee;margin:20px 0;width:100%;">
    ${rows.map(([l, v]) => detailRow(l, v)).join("")}
  </table>`;
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
  const base = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console";

  // 1. Cerca se il contatto esiste già nella lista
  const searchRes = await fetch(
    `${base}/List/${listId}/Recipients/EmailOptins?pageSize=1&pageNumber=1&filterby="Email='${recipient.email}'"`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = searchRes.ok ? await searchRes.json() : null;
  const existing = searchData?.Items?.[0];

  if (existing?.idRecipient) {
    // Contatto già in lista → aggiungilo solo al gruppo
    await fetch(`${base}/Group/${groupId}/Recipient`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ idRecipient: existing.idRecipient }),
    });
  } else {
    // Nuovo contatto → crealo direttamente nel gruppo
    await fetch(`${base}/Group/${groupId}/Recipient`, {
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
  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString(
    "it-IT",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const html = emailLayout(`
    <p>Gentile <strong>${booking.nome} ${booking.cognome}</strong>,</p>
    <p>abbiamo ricevuto la tua richiesta di prenotazione per il <strong>Laboratorio Display Techno</strong>.</p>
    ${detailTable([
      ["Data richiesta", dateFormatted],
      ["Orario", "h. 8.00 – 13.00"],
      ["Istituto / Plesso", booking.istituto],
      ["Classe", booking.classe],
      ["Partecipanti", `${booking.n_alunni} alunni + ${booking.n_adulti} adulti`],
    ])}
    <p>Lo staff del Centro Steadycam ti contatterà a breve per <strong>confermare definitivamente</strong> la prenotazione.</p>
    <p style="margin-top:28px;color:#888888;font-size:13px;">Se non hai effettuato tu questa richiesta, ignora questa email.</p>
  `);

  await sendMail({
    to: booking.email,
    toName: `${booking.nome} ${booking.cognome}`,
    subject: "Prenotazione ricevuta — Display Techno | Centro Steadycam",
    html,
  });
}

// ── 2. Conferma approvazione manuale ──────────────────────────────────────
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
  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString(
    "it-IT",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const html = emailLayout(`
    <p>Gentile <strong>${booking.nome} ${booking.cognome}</strong>,</p>
    <p>siamo lieti di comunicarti che la tua prenotazione per il <strong>Laboratorio Display Techno</strong> è stata <strong style="color:#3a8a35;">confermata</strong>!</p>
    ${detailTable([
      ["Data confermata", dateFormatted],
      ["Orario", "h. 8.00 – 13.00"],
      ["Istituto / Plesso", booking.istituto],
      ["Classe", booking.classe],
      ["Partecipanti", `${booking.n_alunni} alunni + ${booking.n_adulti} adulti`],
    ])}
    <p>Vi aspettiamo! Per qualsiasi informazione puoi contattarci tramite il sito.</p>
    <p style="margin-top:28px;">A presto,<br><strong>Staff Centro Steadycam</strong></p>
  `);

  await sendMail({
    to: booking.email,
    toName: `${booking.nome} ${booking.cognome}`,
    subject: "Prenotazione confermata — Display Techno | Centro Steadycam",
    html,
  });
}

// ── 3. Promemoria prima della visita ──────────────────────────────────────
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
  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString(
    "it-IT",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const html = emailLayout(`
    <p>Gentile <strong>${booking.nome} ${booking.cognome}</strong>,</p>
    <p>ti ricordiamo che la visita al <strong>Laboratorio Display Techno</strong> è prevista <strong>tra ${booking.reminderDays} ${booking.reminderDays === 1 ? "giorno" : "giorni"}</strong>.</p>
    ${detailTable([
      ["Data", dateFormatted],
      ["Orario", "h. 8.00 – 13.00"],
      ["Istituto / Plesso", booking.istituto],
      ["Classe", booking.classe],
      ["Partecipanti", `${booking.n_alunni} alunni + ${booking.n_adulti} adulti`],
    ])}
    <p>Per informazioni o modifiche contattaci tramite il sito.</p>
    <p style="margin-top:28px;">A presto,<br><strong>Staff Centro Steadycam</strong></p>
  `);

  await sendMail({
    to: booking.email,
    toName: `${booking.nome} ${booking.cognome}`,
    subject: `Promemoria visita tra ${booking.reminderDays} giorni — Display Techno | Centro Steadycam`,
    html,
  });
}
