/**
 * WordPress → Supabase Migration Script
 *
 * Usage:
 *   cp .env.local .env   # ensure SUPABASE_SERVICE_ROLE_KEY is set
 *   npm run migrate
 *
 * What it does:
 *   1. Migrates all WP posts (blog, home_grid, adam_archivio) to Supabase `posts` table
 *   2. Migrates all WP pages to Supabase `posts` table (type='page')
 *   3. Migrates categories
 *   4. Migrates media metadata (and optionally downloads images to Supabase Storage)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const WP_API = "https://centrosteadycam.it/wp-json/wp/v2";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function wpFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<{ data: T[]; total: number }> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`WP error ${res.status}: ${url}`);
  return {
    data: await res.json(),
    total: Number(res.headers.get("X-WP-Total") || 0),
  };
}

async function wpFetchAll<T>(endpoint: string, extra: Record<string, string | number> = {}): Promise<T[]> {
  const perPage = 100;
  const first = await wpFetch<T>(endpoint, { per_page: perPage, page: 1, ...extra });
  const totalPages = Math.ceil(first.total / perPage);
  const results: T[] = [...first.data];

  for (let p = 2; p <= totalPages; p++) {
    const { data } = await wpFetch<T>(endpoint, { per_page: perPage, page: p, ...extra });
    results.push(...data);
    process.stdout.write(`  ${endpoint} page ${p}/${totalPages}\r`);
  }
  return results;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function getFeaturedMediaUrl(post: Record<string, unknown>): { url: string | null; alt: string | null } {
  const embedded = (post._embedded as Record<string, unknown>)?.["wp:featuredmedia"] as Array<Record<string, unknown>>;
  if (!embedded?.[0]) return { url: null, alt: null };
  const media = embedded[0];
  const details = media.media_details as Record<string, unknown>;
  const sizes = details?.sizes as Record<string, { source_url: string }>;
  const url =
    sizes?.large?.source_url ||
    sizes?.full?.source_url ||
    (media.source_url as string) ||
    null;
  return { url, alt: (media.alt_text as string) || null };
}

// ── Migration functions ───────────────────────────────────────────────────────

async function migratePosts() {
  console.log("\n📝 Migrating posts...");
  const posts = await wpFetchAll<Record<string, unknown>>("/posts", { _embed: "1", status: "publish" });
  console.log(`  Found ${posts.length} posts`);

  const rows = posts.map((post) => {
    const { url, alt } = getFeaturedMediaUrl(post);
    return {
      wp_id: post.id as number,
      slug: post.slug as string,
      type: "post",
      title: stripHtml((post.title as { rendered: string }).rendered),
      content: (post.content as { rendered: string }).rendered,
      excerpt: stripHtml((post.excerpt as { rendered: string }).rendered),
      featured_image_url: url,
      featured_image_alt: alt,
      date: post.date as string,
      modified: post.modified as string,
      categories: post.categories as number[],
      tags: post.tags as number[],
      status: "publish",
    };
  });

  const { error } = await supabase.from("posts").upsert(rows, { onConflict: "wp_id" });
  if (error) console.error("  Posts error:", error.message);
  else console.log(`  ✅ ${rows.length} posts migrated`);
}

async function migratePages() {
  console.log("\n📄 Migrating pages...");
  const pages = await wpFetchAll<Record<string, unknown>>("/pages", { _embed: "1", status: "publish" });
  console.log(`  Found ${pages.length} pages`);

  const rows = pages.map((page) => {
    const { url, alt } = getFeaturedMediaUrl(page);
    return {
      wp_id: page.id as number,
      slug: `page-${page.slug as string}`, // prefix to avoid conflicts with post slugs
      type: "page",
      title: stripHtml((page.title as { rendered: string }).rendered),
      content: (page.content as { rendered: string }).rendered,
      excerpt: stripHtml(((page.excerpt as { rendered: string })?.rendered) || ""),
      featured_image_url: url,
      featured_image_alt: alt,
      date: page.date as string,
      modified: page.modified as string,
      categories: [],
      tags: [],
      status: "publish",
    };
  });

  const { error } = await supabase.from("posts").upsert(rows, { onConflict: "wp_id" });
  if (error) console.error("  Pages error:", error.message);
  else console.log(`  ✅ ${rows.length} pages migrated`);
}

async function migrateAdamArchivio() {
  console.log("\n🗂️ Migrating ADAM archivio...");
  const items = await wpFetchAll<Record<string, unknown>>("/adam_archivio", { status: "publish" });
  console.log(`  Found ${items.length} items`);

  const rows = items.map((item) => ({
    wp_id: (item.id as number) + 1000000, // offset to avoid ID collision with posts
    slug: `adam-${item.slug as string}`,
    type: "adam_archivio",
    title: stripHtml((item.title as { rendered: string }).rendered),
    content: (item.content as { rendered: string }).rendered,
    excerpt: stripHtml(((item.excerpt as { rendered: string })?.rendered) || ""),
    featured_image_url: null,
    featured_image_alt: null,
    date: item.date as string,
    modified: item.modified as string,
    categories: [],
    tags: [],
    status: "publish",
  }));

  const { error } = await supabase.from("posts").upsert(rows, { onConflict: "wp_id" });
  if (error) console.error("  ADAM error:", error.message);
  else console.log(`  ✅ ${rows.length} ADAM items migrated`);
}

async function migrateCategories() {
  console.log("\n🏷️ Migrating categories...");
  const { data } = await wpFetch<Record<string, unknown>>("/categories", { per_page: 100 });

  const rows = data.map((cat) => ({
    wp_id: cat.id as number,
    name: cat.name as string,
    slug: cat.slug as string,
    description: (cat.description as string) || "",
    parent_wp_id: (cat.parent as number) || 0,
    post_count: (cat.count as number) || 0,
  }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "wp_id" });
  if (error) console.error("  Categories error:", error.message);
  else console.log(`  ✅ ${rows.length} categories migrated`);
}

async function migrateMediaMetadata() {
  console.log("\n🖼️ Migrating media metadata...");
  const items = await wpFetchAll<Record<string, unknown>>("/media");
  console.log(`  Found ${items.length} media items`);

  const rows = items.map((m) => {
    const details = m.media_details as Record<string, unknown>;
    return {
      wp_id: m.id as number,
      slug: m.slug as string,
      title: stripHtml((m.title as { rendered: string }).rendered),
      source_url: m.source_url as string,
      supabase_url: null,
      alt_text: (m.alt_text as string) || "",
      caption: stripHtml(((m.caption as { rendered: string })?.rendered) || ""),
      mime_type: m.mime_type as string,
      width: Math.round((details?.width as number) || 0),
      height: Math.round((details?.height as number) || 0),
    };
  });

  // Batch insert
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("media").upsert(batch, { onConflict: "wp_id" });
    if (error) console.error(`  Media batch error:`, error.message);
    else inserted += batch.length;
    process.stdout.write(`  Progress: ${inserted}/${rows.length}\r`);
  }
  console.log(`\n  ✅ ${inserted} media items migrated`);
}

async function migrateImagesToStorage() {
  console.log("\n📦 Migrating images to Supabase Storage...");
  console.log("  (This downloads images from WP and uploads to Supabase Storage)");

  const { data: mediaItems, error } = await supabase
    .from("media")
    .select("*")
    .is("supabase_url", null)
    .ilike("mime_type", "image/%")
    .limit(50); // Start with first 50

  if (error) { console.error(error.message); return; }

  let migrated = 0;
  for (const item of mediaItems || []) {
    try {
      const res = await fetch(item.source_url);
      if (!res.ok) continue;

      const buffer = await res.arrayBuffer();
      const ext = item.source_url.split(".").pop()?.split("?")[0] || "jpg";
      const storagePath = `wp-uploads/${item.wp_id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(storagePath, buffer, {
          contentType: item.mime_type,
          upsert: true,
        });

      if (uploadError) { console.error(`  Upload error for ${item.wp_id}:`, uploadError.message); continue; }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(storagePath);
      await supabase.from("media").update({ supabase_url: urlData.publicUrl }).eq("wp_id", item.wp_id);
      migrated++;
      process.stdout.write(`  Migrated ${migrated} images\r`);
    } catch (e) {
      console.error(`  Failed for media ${item.wp_id}:`, e);
    }
  }
  console.log(`\n  ✅ ${migrated} images migrated to Supabase Storage`);
  console.log("  Run again to migrate more (50 at a time)");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting WordPress → Supabase migration");
  console.log(`   WP API: ${WP_API}`);
  console.log(`   Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  const args = process.argv.slice(2);
  const runAll = args.length === 0;

  if (runAll || args.includes("--posts")) await migratePosts();
  if (runAll || args.includes("--pages")) await migratePages();
  if (runAll || args.includes("--adam")) await migrateAdamArchivio();
  if (runAll || args.includes("--categories")) await migrateCategories();
  if (runAll || args.includes("--media")) await migrateMediaMetadata();
  if (args.includes("--images")) await migrateImagesToStorage();

  console.log("\n✅ Migration complete!");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
