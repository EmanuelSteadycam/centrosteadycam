import { createSupabaseAdminClient } from "./supabase-server";
export { type BlogPost, formatBlogDate, formatBlogDateShort } from "./blog-types";
import type { BlogPost } from "./blog-types";

export const BLOG_CATEGORY_ID = 19;

export async function getBlogPosts(page = 1, perPage = 100) {
  const supabase = createSupabaseAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, featured_image_url, date, status", { count: "exact" })
    .eq("type", "post")
    .eq("status", "publish")
    .contains("categories", [BLOG_CATEGORY_ID])
    .order("date", { ascending: false })
    .range(from, to);

  return {
    data: (data ?? []) as BlogPost[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("type", "post")
    .single();
  return (data as BlogPost) ?? null;
}

export async function getRecentBlogPosts(limit = 4, excludeSlug?: string): Promise<BlogPost[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, featured_image_url, date")
    .eq("type", "post")
    .eq("status", "publish")
    .contains("categories", [BLOG_CATEGORY_ID])
    .order("date", { ascending: false })
    .limit(limit + 1);

  const posts = (data ?? []) as BlogPost[];
  return excludeSlug ? posts.filter((p) => p.slug !== excludeSlug).slice(0, limit) : posts.slice(0, limit);
}

