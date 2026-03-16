import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only client (with service role for migration)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Database types ────────────────────────────────────────────────────────────

export interface DbPost {
  id: number;
  wp_id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  date: string;
  modified: string;
  categories: number[];
  tags: number[];
  type: string; // 'post' | 'page' | 'adam_archivio'
  created_at?: string;
}

export interface DbMedia {
  id: number;
  wp_id: number;
  slug: string;
  title: string;
  source_url: string;
  supabase_url: string | null;
  alt_text: string;
  mime_type: string;
  width: number;
  height: number;
  created_at?: string;
}
