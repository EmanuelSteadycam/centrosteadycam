import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getBlogPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: stripHtml(post.title.rendered),
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const [post, { data: recent }] = await Promise.all([
    getPost(params.slug),
    getBlogPosts(1, 4),
  ]);

  if (!post) notFound();

  const imgUrl = getFeaturedImageUrl(post, "full");
  const recentPosts = recent.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      {imgUrl && (
        <div className="relative h-64 md:h-96 bg-brand-navy overflow-hidden">
          <Image
            src={imgUrl}
            alt={post.title.rendered}
            fill
            className="object-cover opacity-60"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title block */}
        <div className={`${imgUrl ? "-mt-20 relative z-10" : "pt-28"} mb-12`}>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-teal text-sm font-medium mb-6 hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Blog
            </Link>

            <p className="text-brand-teal text-sm font-semibold uppercase tracking-wider mb-3">
              {formatDate(post.date)}
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </div>
        </div>

        {/* Content */}
        <article className="pb-16">
          <div
            className="wp-content prose prose-lg max-w-none prose-headings:text-brand-navy prose-a:text-brand-teal"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </article>

        {/* Recent posts */}
        {recentPosts.length > 0 && (
          <div className="border-t border-gray-100 pt-12 pb-16">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Articoli recenti</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((rp) => {
                const rpImg = getFeaturedImageUrl(rp);
                return (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="card group">
                    {rpImg && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={rpImg} alt={rp.title.rendered} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-brand-teal text-xs font-semibold uppercase tracking-wider mb-1">{formatDate(rp.date)}</p>
                      <h3 className="font-semibold text-brand-navy text-sm line-clamp-2 group-hover:text-brand-teal transition-colors" dangerouslySetInnerHTML={{ __html: rp.title.rendered }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
