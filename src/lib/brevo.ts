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

// ── 5. Campagna newsletter da articolo del blog ──────────────────────────────
export async function sendNewsletterCampaign(post: {
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
}, listId: number = NEWSLETTER_LIST_ID): Promise<{ campaignId: number }> {
  const SITE = process.env.SITE_URL ?? "https://centrosteadycam.it";
  const BANNER = `${SITE}/media/01Banner-Centro-Steadycam2.png`;
  const postUrl = `${SITE}/blog/${post.slug}`;

  const imageBlock = post.featured_image_url
    ? `<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
        <tbody><tr><td style="padding:0">
          <a href="${postUrl}" target="_blank" style="outline:none">
            <img src="${post.featured_image_url.startsWith("/") ? SITE + post.featured_image_url : post.featured_image_url}"
              style="display:block;width:100%;max-width:600px;height:auto;border:0" width="600" alt="${post.title}">
          </a>
        </td></tr></tbody>
      </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${post.title}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Lato:wght@700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fff">
<tbody><tr><td>

  <!-- Banner -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;margin:0 auto">
    <tbody><tr><td style="padding:0;line-height:0">
      <a href="${SITE}" target="_blank" style="outline:none">
        <img src="${BANNER}" width="600" alt="Centro Steadycam" style="display:block;width:100%;max-width:600px;height:auto;border:0">
      </a>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Titolo -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#fff;margin:0 auto">
    <tbody><tr><td style="padding:20px 10px 10px;font-family:'Lato',Arial,sans-serif;font-size:30px;font-weight:700;color:#555555;line-height:1.2">
      <span style="font-family:'Lato',Arial,sans-serif;font-size:30px;font-weight:700;color:#555555;line-height:1.2">${post.title}</span>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Immagine articolo -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;margin:0 auto">
    <tbody><tr><td style="padding:0 0 10px">
      ${imageBlock}
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Testo estratto -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="10" cellspacing="0" width="600" style="max-width:600px;background-color:#fff;margin:0 auto">
    <tbody><tr><td style="padding:10px">
      <div style="font-family:'Open Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6">
        <p style="margin:0">${post.excerpt ?? ""}</p>
      </div>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Bottone Leggi -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="10" cellspacing="0" width="600" style="max-width:600px;margin:0 auto">
    <tbody><tr><td align="right" style="padding:10px">
      <a href="${postUrl}" target="_blank"
        style="display:inline-block;background-color:#8ac893;color:#fff;font-family:Arial,sans-serif;font-size:16px;font-weight:400;text-decoration:none;padding:8px 24px;border-radius:4px">
        Leggi
      </a>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Footer contatti -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="10" cellspacing="0" width="600" style="max-width:600px;margin:0 auto">
    <tbody><tr><td style="padding:20px 10px;text-align:center;font-family:Roboto,Arial,sans-serif;font-size:14px;color:#555">
      <p style="margin:0">Lo Staff Steadycam</p>
      <p style="margin:4px 0">info@centrosteadycam.it</p>
      <p style="margin:4px 0">0173 316210</p>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

  <!-- Divisore -->
  <table align="center" width="75%" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto">
  <tbody><tr><td height="1" style="font-size:0;line-height:1px;border-top:2px solid #8ac893">&nbsp;</td></tr></tbody>
  </table>

  <!-- Footer legale -->
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
  <tbody><tr><td>
    <table align="center" border="0" cellpadding="10" cellspacing="0" width="600" style="max-width:600px;margin:0 auto">
    <tbody><tr><td style="padding:16px 10px;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#a5a5a5;line-height:1.6">
      <p style="margin:0 0 6px">Ricevi questa mail perché ti sei iscritto/a alla newsletter o hai partecipato a un nostro progetto.</p>
      <p style="margin:0 0 6px">
        <a href="{{unsubscribe}}" style="color:#a5a5a5;text-decoration:underline">Cancella iscrizione</a>
        &nbsp;|&nbsp;
        <a href="{{unsubscribe}}" style="color:#a5a5a5;text-decoration:underline">Unsubscribe</a>
      </p>
      <p style="margin:0">2025 © Centro Steadycam - ASL CN2 Alba Bra</p>
    </td></tr></tbody>
    </table>
  </td></tr></tbody>
  </table>

</td></tr></tbody>
</table>
</body></html>`;

  const now = new Date().toLocaleDateString("it-IT");
  const campaign = await brevoPost("/emailCampaigns", {
    name: `STEADYNEWS — ${post.title} — ${now}`,
    subject: post.title,
    sender: SENDER,
    type: "classic",
    htmlContent: html,
    recipients: { listIds: [listId] },
  });

  await brevoPost(`/emailCampaigns/${campaign.id}/sendNow`, {});
  return { campaignId: campaign.id };
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
