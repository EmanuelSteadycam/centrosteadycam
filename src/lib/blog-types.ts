export type BlogPost = {
  id: number;
  wp_id: number | null;
  slug: string;
  type: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  date: string;
  modified: string | null;
  categories: number[];
  status: string;
};

export function formatBlogDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatBlogDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
