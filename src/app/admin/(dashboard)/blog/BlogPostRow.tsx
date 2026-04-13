"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deletePost, togglePostStatus } from "./actions";

type Post = {
  id: number;
  slug: string;
  title: string;
  date: string;
  status: string;
  featured_image_url: string | null;
};

export default function BlogPostRow({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(post.status);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const handleDelete = () => {
    if (!confirm(`Eliminare "${post.title}"?`)) return;
    startTransition(async () => {
      const result = await deletePost(post.id, post.slug);
      if (!result.error) setDeleted(true);
      else alert(result.error);
    });
  };

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePostStatus(post.id, post.slug, status);
      if (!result.error) setStatus(status === "publish" ? "draft" : "publish");
      else alert(result.error);
    });
  };

  return (
    <div className="px-5 py-3 flex items-center gap-4">
      {/* Thumbnail */}
      <div className="w-14 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(post.date).toLocaleDateString("it-IT")} · /{post.slug}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors disabled:opacity-40 ${
            status === "publish"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {status === "publish" ? "Pubblicato" : "Bozza"}
        </button>
        <Link
          href={`/admin/blog/${post.id}`}
          className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-2 py-1 rounded transition-colors"
        >
          Modifica
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-2 py-1 rounded transition-colors disabled:opacity-40"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
