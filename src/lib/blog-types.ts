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
  author_name: string | null;
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
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleDateString("it-IT", { month: "short" }).replace(".", "").toUpperCase();
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}
