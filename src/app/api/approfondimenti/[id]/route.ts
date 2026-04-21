import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "id non valido" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("approfondimenti")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "non trovato" }, { status: 404 });
  return NextResponse.json(data);
}
