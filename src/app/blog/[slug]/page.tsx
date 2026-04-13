export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getRecentBlogPosts } from "@/lib/blog";
import { formatBlogDate } from "@/lib/blog-types";
import BlogSidebarCards from "@/components/BlogSidebarCards";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt?.slice(0, 160) ?? "",
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const [post, recent] = await Promise.all([
    getBlogPost(params.slug),
    getRecentBlogPosts(20, params.slug),
  ]);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white pt-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Two-column layout */}
        <div className="flex gap-4 items-stretch">

          {/* LEFT — main content */}
          <div className="flex-[2] min-w-0">
            {/* Hero image */}
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt ?? post.title}
                className="w-full block"
              />
            )}

            {/* Title + meta */}
            <div className="pt-6 pb-4">
              <h1 className="text-2xl md:text-3xl font-title font-bold text-brand-navy leading-tight mb-3">
                {post.title}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Staff Steadycam
                <span className="mx-2 text-gray-300">|</span>
                {formatBlogDate(post.date)}
              </p>
            </div>

            {/* Content */}
            <article>
              <div
                className="wp-content prose prose-base max-w-none prose-headings:text-brand-navy prose-a:text-[#8ac893]"
                dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
              />
            </article>
          </div>

          {/* RIGHT — sidebar cards */}
          {recent.length > 0 && <BlogSidebarCards posts={recent} />}
        </div>

      </div>
    </div>
  );
}
