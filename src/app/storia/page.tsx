import CovidTimelineClone from "@/components/CovidTimelineClone";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function StoriaPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("timeline_entries")
    .select("year, description")
    .order("year", { ascending: true });

  return (
    <main>
      <CovidTimelineClone entries={data ?? []} />
    </main>
  );
}
