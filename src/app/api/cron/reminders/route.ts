import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendReminderEmail } from "@/lib/mailup";

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminderDays = Number(process.env.REMINDER_DAYS ?? "3");

  // Calculate target date (today + reminderDays)
  const target = new Date();
  target.setDate(target.getDate() + reminderDays);
  const targetDate = target.toISOString().split("T")[0];

  const supabase = createSupabaseAdminClient();
  const { data: bookings, error } = await supabase
    .from("display_bookings")
    .select("*, display_slots!inner(date)")
    .eq("status", "confirmed")
    .eq("display_slots.date", targetDate);

  if (error) {
    console.error("Reminders cron DB error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return Response.json({ sent: 0, date: targetDate });
  }

  let sent = 0;
  for (const b of bookings) {
    try {
      await sendReminderEmail({
        nome: b.nome,
        cognome: b.cognome,
        email: b.email,
        istituto: b.istituto,
        classe: b.classe,
        n_alunni: b.n_alunni,
        n_adulti: b.n_adulti,
        date: b.display_slots.date,
        reminderDays,
      }, b.mailup_id);
      sent++;
    } catch (err) {
      console.error(`Reminder failed for booking ${b.id}:`, err);
    }
  }

  return Response.json({ sent, total: bookings.length, date: targetDate });
}
