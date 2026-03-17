import type {
  WPPost,
  WPPage,
  WPMedia,
  WPCategory,
  WPAdamArchivio,
  WPApiResponse,
} from "@/types/wordpress";

const WP_API = process.env.WORDPRESS_API_URL || "https://centrosteadycam.it/wp-json/wp/v2";

async function wpFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // 1h cache
    headers: { "User-Agent": "CentroSteadycam-React/1.0" },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!res.ok) throw new Error(`WP API error: ${res.status} ${url.toString()}`);

  const data = await res.json();
  return {
    data,
    total: Number(res.headers.get("X-WP-Total") || 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") || 1),
  };
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(params: {
  page?: number;
  perPage?: number;
  categories?: number[];
  search?: string;
  embed?: boolean;
} = {}): Promise<WPApiResponse<WPPost>> {
  const query: Record<string, string | number> = {
    per_page: params.perPage ?? 12,
    page: params.page ?? 1,
    status: "publish",
  };
  if (params.categories?.length) query.categories = params.categories.join(",");
  if (params.search) query.search = params.search;
  if (params.embed) query._embed = "1";

  const { data, total, totalPages } = await wpFetch<WPPost[]>("/posts", query);
  return { data, total, totalPages };
}

export async function getPost(slug: string): Promise<WPPost | null> {
  const { data } = await wpFetch<WPPost[]>("/posts", {
    slug,
    _embed: "1",
  });
  return data[0] ?? null;
}

export async function getPostById(id: number): Promise<WPPost | null> {
  try {
    const { data } = await wpFetch<WPPost>(`/posts/${id}`);
    return data;
  } catch {
    return null;
  }
}

// ── Blog posts (category 19) ──────────────────────────────────────────────

export async function getBlogPosts(page = 1, perPage = 12) {
  return getPosts({ page, perPage, categories: [19], embed: true });
}

// ── Home grid posts (category 22) ────────────────────────────────────────

export async function getHomeGridPosts() {
  return getPosts({ perPage: 20, categories: [22], embed: true });
}

// ── Pages ────────────────────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<WPPage | null> {
  const { data } = await wpFetch<WPPage[]>("/pages", { slug, _embed: "1" });
  return data[0] ?? null;
}

export async function getPageById(id: number): Promise<WPPage | null> {
  try {
    const { data } = await wpFetch<WPPage>(`/pages/${id}`);
    return data;
  } catch {
    return null;
  }
}

// ── Media ────────────────────────────────────────────────────────────────────

export async function getMedia(id: number): Promise<WPMedia | null> {
  try {
    const { data } = await wpFetch<WPMedia>(`/media/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function getMediaList(perPage = 100, page = 1) {
  return wpFetch<WPMedia[]>("/media", { per_page: perPage, page });
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<WPCategory[]> {
  const { data } = await wpFetch<WPCategory[]>("/categories", { per_page: 100 });
  return data;
}

// ── ADAM Archivio (custom post type) ─────────────────────────────────────────

export async function getAdamArchivio(params: {
  page?: number;
  perPage?: number;
  search?: string;
} = {}): Promise<WPApiResponse<WPAdamArchivio>> {
  const query: Record<string, string | number> = {
    per_page: params.perPage ?? 20,
    page: params.page ?? 1,
    status: "publish",
  };
  if (params.search) query.search = params.search;

  const { data, total, totalPages } = await wpFetch<WPAdamArchivio[]>("/adam_archivio", query);
  return { data, total, totalPages };
}

export async function getAdamArchivioItem(slug: string): Promise<WPAdamArchivio | null> {
  const { data } = await wpFetch<WPAdamArchivio[]>("/adam_archivio", { slug });
  return data[0] ?? null;
}

// ── Staff post (ID 28258) ─────────────────────────────────────────────────────

export async function getStaffPost(): Promise<WPPost | null> {
  return getPostById(28258);
}

// ── Contatti post (ID 26710) ──────────────────────────────────────────────────

export async function getContattiPost(): Promise<WPPost | null> {
  return getPostById(26710);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getFeaturedImageUrl(post: WPPost | WPPage, size = "large"): string | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return (
    media.media_details?.sizes?.[size]?.source_url ||
    media.media_details?.sizes?.full?.source_url ||
    media.source_url ||
    null
  );
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
