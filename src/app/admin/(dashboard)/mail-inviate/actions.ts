"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendFullNewsletterCampaign, buildNewsletterEmailHtml } from "@/lib/brevo";

type MailData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
};

export async function createMail(data: MailData): Promise<{ error: string | null; id?: number }> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("posts")
    .insert({
      type: "newsletter",
      categories: [],
      tags: [],
      status: "draft",
      date: new Date().toISOString(),
      ...data,
      featured_image_url: data.featured_image_url || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/mail-inviate");
  return { error: null, id: row.id };
}

export async function updateMail(id: number, data: MailData): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("posts")
    .update({
      ...data,
      featured_image_url: data.featured_image_url || null,
      modified: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/mail-inviate");
  return { error: null };
}

export async function deleteMail(id: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/mail-inviate");
  return { error: null };
}

export async function previewMailHtml(data: {
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
}): Promise<string> {
  return buildNewsletterEmailHtml({
    title: data.title || "(senza titolo)",
    excerpt: data.excerpt || null,
    content: data.content,
    featured_image_url: data.featured_image_url || null,
  });
}

export async function sendMailNewsletter(id: number, listId: number): Promise<{ error: string | null; campaignId?: number | null; isTest?: boolean }> {
  const supabase = createSupabaseAdminClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("title, excerpt, content, featured_image_url")
    .eq("id", id)
    .single();

  if (error || !post) return { error: "Articolo non trovato" };

  const { campaignId, isTest } = await sendFullNewsletterCampaign(post, listId);

  if (!isTest) {
    await supabase
      .from("posts")
      .update({ newsletter_sent_at: new Date().toISOString(), newsletter_list_id: listId })
      .eq("id", id);
    revalidatePath("/admin/mail-inviate");
  }

  return { error: null, campaignId, isTest };
}
