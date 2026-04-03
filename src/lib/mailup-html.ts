const BANNER = "http://centrosteadycam.it/wp-content/uploads/01Banner-Centro-Steadycam2.png";
const LOGO   = "https://centrosteadycam.it/wp-content/uploads/Logo_Display21_6x3.5.png";

function esc(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── struttura comune ──────────────────────────────────────────────────────
function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap');
    body{margin:0;padding:0;background-color:#000000;}
    table{border-collapse:collapse;}
    img{display:block;border:0;outline:none;-ms-interpolation-mode:bicubic;}
    a{color:#88bf81;text-decoration:none;}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#000000;" bgcolor="#000000">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color:#000000;">
  <tr><td align="center" style="padding:20px 10px;">
    <table width="650" cellpadding="0" cellspacing="0" border="0" style="max-width:650px;width:100%;background-color:#000000;" bgcolor="#000000">

      <!-- banner -->
      <tr><td style="padding:0;line-height:0;">
        <img src="${BANNER}" width="650" alt="Centro Steadycam" style="display:block;width:100%;max-width:650px;height:auto;">
      </td></tr>

      <!-- logo -->
      <tr><td align="center" bgcolor="#000000" style="background-color:#000000;padding:36px 40px 28px;">
        <img src="${LOGO}" width="280" alt="Laboratorio Display" style="display:block;width:280px;max-width:100%;height:auto;">
      </td></tr>

      <!-- divisore -->
      <tr><td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td height="1" bgcolor="#222222" style="font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td></tr>

      ${body}

      <!-- footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
        <p style="margin:0 0 6px;font-family:'Raleway',Arial,sans-serif;font-size:12px;font-weight:600;color:#555555;letter-spacing:0.05em;">Centro Steadycam — ASL CN2 Alba-Bra</p>
        <p style="margin:0 0 14px;font-family:'Raleway',Arial,sans-serif;font-size:12px;font-weight:300;color:#444444;">
          <a href="https://centrosteadycam.it" style="color:#88bf81;">centrosteadycam.it</a>
        </p>
        <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:300;color:#3a3a3a;line-height:1.7;">
          Hai ricevuto questa email in riferimento a una visita al Laboratorio Display.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── box riepilogo ─────────────────────────────────────────────────────────
function summaryRow(label: string, value: string): string {
  return `<p style="margin:0 0 4px;font-family:'Raleway',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#555555;">${label}</p>
<p style="margin:0 0 18px;font-family:'Raleway',Arial,sans-serif;font-size:15px;font-weight:400;color:#ffffff;">${value}</p>`;
}

function summaryRowMuted(label: string, value: string): string {
  return `<p style="margin:0 0 4px;font-family:'Raleway',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#555555;">${label}</p>
<p style="margin:0 0 18px;font-family:'Raleway',Arial,sans-serif;font-size:15px;font-weight:400;color:#888888;">${value}</p>`;
}

function box(rows: string, borderColor = "#88bf81"): string {
  return `<tr><td style="padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111111" style="background-color:#111111;border-left:3px solid ${borderColor};">
      <tr><td style="padding:24px 28px;">${rows}</td></tr>
    </table>
  </td></tr>`;
}

// ── 1. Conferma (ID 60) ───────────────────────────────────────────────────
export function buildConfirmationHtml(b: {
  nome: string; cognome: string; istituto: string; classe: string;
  n_alunni: number; n_adulti: number; date: string;
}): string {
  return layout("Richiesta ricevuta — Laboratorio Display", `
    <tr><td style="padding:32px 40px 8px;">
      <p style="margin:0 0 10px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#88bf81;">Laboratorio Display</p>
      <h1 style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:26px;font-weight:300;color:#ffffff;line-height:1.3;">Abbiamo ricevuto la tua richiesta</h1>
    </td></tr>

    <tr><td style="padding:20px 40px 0;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Gentile <strong style="font-weight:600;">${esc(b.nome)} ${esc(b.cognome)}</strong>,</p>
      <p style="margin:0;">abbiamo ricevuto la tua richiesta di visita al <strong style="font-weight:600;">Laboratorio Display</strong>.
      La tua iscrizione è in fase di valutazione da parte del nostro staff.
      Riceverai una comunicazione non appena la richiesta sarà stata esaminata.</p>
    </td></tr>

    ${box(
      summaryRow("Data della visita", esc(b.date)) +
      summaryRow("Istituto scolastico", esc(b.istituto)) +
      summaryRow("Classe", esc(b.classe)) +
      summaryRow("Partecipanti", `${b.n_alunni} alunni + ${b.n_adulti} adulti`)
    )}

    <tr><td style="padding:0 40px 36px;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Per ulteriori informazioni visita il sito <a href="https://centrosteadycam.it" style="color:#88bf81;">centrosteadycam.it</a>.</p>
      <p style="margin:0;color:#888888;">A presto,<br><span style="color:#ffffff;font-weight:400;">Lo staff del Laboratorio Display</span></p>
    </td></tr>
  `);
}

// ── 2. Approvazione (ID 59) ───────────────────────────────────────────────
export function buildApprovalHtml(b: {
  nome: string; cognome: string; istituto: string; classe: string;
  n_alunni: number; n_adulti: number; date: string;
}): string {
  return layout("Visita confermata — Laboratorio Display", `
    <tr><td style="padding:32px 40px 8px;">
      <p style="margin:0 0 10px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#88bf81;">Laboratorio Display</p>
      <h1 style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:26px;font-weight:300;color:#ffffff;line-height:1.3;">La tua visita è confermata</h1>
    </td></tr>

    <tr><td style="padding:20px 40px 0;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Gentile <strong style="font-weight:600;">${esc(b.nome)} ${esc(b.cognome)}</strong>,</p>
      <p style="margin:0;">siamo lieti di comunicarti che la tua visita al <strong style="font-weight:600;">Laboratorio Display</strong>
      è stata <strong style="font-weight:600;color:#88bf81;">confermata</strong>.
      Ti aspettiamo con la tua classe nella data indicata.</p>
    </td></tr>

    ${box(
      summaryRow("Data della visita", esc(b.date)) +
      summaryRow("Istituto scolastico", esc(b.istituto)) +
      summaryRow("Classe", esc(b.classe)) +
      summaryRow("Partecipanti", `${b.n_alunni} alunni + ${b.n_adulti} adulti`)
    )}

    <tr><td style="padding:0 40px 36px;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Per informazioni o comunicazioni contattaci dal sito <a href="https://centrosteadycam.it" style="color:#88bf81;">centrosteadycam.it</a>.</p>
      <p style="margin:0;color:#888888;">A presto,<br><span style="color:#ffffff;font-weight:400;">Lo staff del Laboratorio Display</span></p>
    </td></tr>
  `);
}

// ── 3. Rifiuto (ID 58) ────────────────────────────────────────────────────
export function buildRejectionHtml(b: {
  nome: string; cognome: string; istituto: string; classe: string; date: string;
}): string {
  return layout("Aggiornamento richiesta — Laboratorio Display", `
    <tr><td style="padding:32px 40px 8px;">
      <p style="margin:0 0 10px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#88bf81;">Laboratorio Display</p>
      <h1 style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:26px;font-weight:300;color:#ffffff;line-height:1.3;">Aggiornamento sulla tua richiesta</h1>
    </td></tr>

    <tr><td style="padding:20px 40px 0;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Gentile <strong style="font-weight:600;">${esc(b.nome)} ${esc(b.cognome)}</strong>,</p>
      <p style="margin:0;">siamo spiacenti di comunicarti che non ci è possibile confermare la tua visita
      al <strong style="font-weight:600;">Laboratorio Display</strong> per la data indicata.</p>
    </td></tr>

    ${box(
      summaryRowMuted("Data richiesta", esc(b.date)) +
      summaryRowMuted("Istituto scolastico", esc(b.istituto)) +
      summaryRowMuted("Classe", esc(b.classe)),
      "#555555"
    )}

    <tr><td style="padding:0 40px 36px;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 24px;">Puoi effettuare una nuova richiesta scegliendo una data diversa:</p>
      <p style="margin:0 0 24px;">
        <a href="https://centrosteadycam.it/display" style="display:inline-block;padding:12px 28px;background-color:#88bf81;color:#000000;font-family:'Raleway',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">
          Prenota una nuova data
        </a>
      </p>
      <p style="margin:0;color:#888888;">Ci scusiamo per l'inconveniente.<br><span style="color:#ffffff;font-weight:400;">Lo staff del Laboratorio Display</span></p>
    </td></tr>
  `);
}

// ── 4. Promemoria (ID 57) ─────────────────────────────────────────────────
export function buildReminderHtml(b: {
  nome: string; cognome: string; istituto: string; classe: string;
  n_alunni: number; n_adulti: number; date: string; reminderDays: number;
}): string {
  return layout("Promemoria visita — Laboratorio Display", `
    <tr><td style="padding:32px 40px 8px;">
      <p style="margin:0 0 10px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#88bf81;">Laboratorio Display</p>
      <h1 style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:26px;font-weight:300;color:#ffffff;line-height:1.3;">La tua visita si avvicina</h1>
    </td></tr>

    <tr><td style="padding:20px 40px 0;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Gentile <strong style="font-weight:600;">${esc(b.nome)} ${esc(b.cognome)}</strong>,</p>
      <p style="margin:0;">ti ricordiamo che tra
      <strong style="font-weight:600;color:#88bf81;">${b.reminderDays} giorni</strong>
      è in programma la visita della tua classe al <strong style="font-weight:600;">Laboratorio Display</strong>.</p>
    </td></tr>

    ${box(
      summaryRow("Data della visita", esc(b.date)) +
      summaryRow("Istituto scolastico", esc(b.istituto)) +
      summaryRow("Classe", esc(b.classe)) +
      summaryRow("Partecipanti", `${b.n_alunni} alunni + ${b.n_adulti} adulti`)
    )}

    <tr><td style="padding:0 40px 36px;font-family:'Raleway',Arial,sans-serif;font-size:16px;font-weight:300;color:#ffffff;line-height:1.8;">
      <p style="margin:0 0 16px;">Per informazioni o esigenze contattaci dal sito <a href="https://centrosteadycam.it" style="color:#88bf81;">centrosteadycam.it</a>.</p>
      <p style="margin:0;color:#888888;">Ti aspettiamo!<br><span style="color:#ffffff;font-weight:400;">Lo staff del Laboratorio Display</span></p>
    </td></tr>
  `);
}
