import fs from "fs";
import path from "path";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const CSV_PATH = "/Users/emam1/Downloads/2026-07-16_11-08-47_Recipient.csv";

function fixSmsNumber(raw: string): string {
  // MailUp stores Italian numbers as 001XXXXXXXXX instead of +39XXXXXXXXX
  if (raw.startsWith("001")) return "+39" + raw.slice(3);
  return raw;
}

type Contact = { email: string; sms?: string; nome?: string; cognome?: string; jobTitle?: string };

function parseCSV(content: string): Contact[] {
  const lines = content.split("\n").slice(1); // skip header
  const results: Contact[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // CSV fields: Email,Email status,Email subscribe date,SMS,SMS status,SMS subscription date,FirstName,LastName,Company
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, "").trim());
    const email = cols[0];
    if (!email) continue;

    const contact: Contact = { email };
    const rawSms = cols[3];
    if (rawSms) contact.sms = fixSmsNumber(rawSms);
    if (cols[6]) contact.nome = cols[6];
    if (cols[7]) contact.cognome = cols[7];
    if (cols[8]) contact.jobTitle = cols[8];

    results.push(contact);
  }
  return results;
}

async function importContacts(contacts: Contact[]) {
  const jsonBody = contacts.map((c) => {
    const attributes: Record<string, string> = {};
    if (c.sms) attributes.SMS = c.sms;
    if (c.nome) attributes.NOME = c.nome;
    if (c.cognome) attributes.COGNOME = c.cognome;
    if (c.jobTitle) attributes.JOB_TITLE = c.jobTitle;
    return { email: c.email, attributes };
  });

  const response = await fetch("https://api.brevo.com/v3/contacts/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      jsonBody,
      listIds: [3], // STEADYNEWS
      updateExistingContacts: true,
      emptyContactsAttributes: false,
    }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const contacts = parseCSV(content);
  const withSms = contacts.filter((c) => c.sms).length;
  const withNome = contacts.filter((c) => c.nome).length;
  const withJob = contacts.filter((c) => c.jobTitle).length;
  console.log(`Totale contatti: ${contacts.length}`);
  console.log(`  con SMS: ${withSms}, con nome: ${withNome}, con professione: ${withJob}`);

  // Preview first 3
  console.log("Esempi:", contacts.slice(0, 3).map((c) => ({ ...c })));

  const { status, data } = await importContacts(contacts);
  console.log(`Status: ${status}`);
  console.log("Risposta Brevo:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
