"use client";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { formatBlogDateShort, type BlogPost } from "@/lib/blog-types";

type Direction = "top" | "right" | "bottom" | "left";

function getDirection(e: React.MouseEvent, el: HTMLElement): Direction {
  const { left, top, width, height } = el.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle > -135 && angle <= -45) return "top";
  if (angle > -45 && angle <= 45) return "right";
  if (angle > 45 && angle <= 135) return "bottom";
  return "left";
}

const offscreen: Record<Direction, string> = {
  top:    "translateY(-100%)",
  right:  "translateX(100%)",
  bottom: "translateY(100%)",
  left:   "translateX(-100%)",
};

type Variant = "tall" | "wide" | "normal";

/**
 * Cobbles pattern originale — 10 item ripetuti:
 *
 * Gruppo A (0-5):          Gruppo B (6-9):
 * [TALL-0][WIDE-1    ]     [WIDE-6    ][TALL-7]
 * [TALL-0][1×1-2][TALL-3]  [1×1-8][1×1-9][TALL-7]
 * [1×1-4 ][1×1-5][TALL-3]
 */
function getVariant(i: number): Variant {
  const p = i % 10;
  if (p === 0 || p === 3 || p === 7) return "tall";
  if (p === 1 || p === 6) return "wide";
  return "normal";
}

function BlogCard({ post, variant }: { post: BlogPost; variant: Variant }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [transform, setTransform] = useState("translateY(-100%)");
  const [transition, setTransition] = useState("none");

  const img = post.featured_image_url;

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("none");
    setTransform(offscreen[dir]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransition("transform 0.4s ease");
        setTransform("translate(0,0)");
        setHovered(true);
      });
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("transform 0.4s ease");
    setTransform(offscreen[dir]);
    setHovered(false);
  }, []);

  return (
    <Link
      ref={ref}
      href={`/blog/${post.slug}`}
      className={[
        "relative overflow-hidden block",
        variant === "tall" ? "min-[480px]:row-span-2" : "",
        variant === "wide" ? "min-[480px]:col-span-2" : "",
      ].filter(Boolean).join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {img ? (
        <img
          src={img}
          alt={post.title.rendered}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-700" />
      )}

      {/* Overlay verde direzionale */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "rgba(163,211,156,0.38)",
          transform,
          transition,
        }}
      />

      {/* Overlay nero per scurire */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.25)",
          opacity: hovered ? 1 : 0,
        }}
      />


      {/* Titolo — centrato */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <h3
          className="text-white font-title font-semibold text-[26px] leading-snug drop-shadow text-center"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </div>

      {/* Data — in basso */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-4 pointer-events-none transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <p className="text-white text-[11px] font-title uppercase tracking-widest drop-shadow">
          {formatBlogDateShort(post.date)}
        </p>
      </div>
    </Link>
  );
}

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-[10px] [grid-auto-rows:220px] min-[480px]:[grid-auto-rows:237px]">
      {posts.map((post, i) => (
        <BlogCard key={post.id} post={post} variant={getVariant(i)} />
      ))}
    </div>
  );
}
