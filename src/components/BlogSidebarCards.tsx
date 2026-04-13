"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
  top: "translateY(-100%)",
  right: "translateX(100%)",
  bottom: "translateY(100%)",
  left: "translateX(-100%)",
};

const MIN_CARD_H = 237; // uguale alle tile 1x1 del blog grid
const CARD_GAP = 3;     // gap tra card (px)
const LINK_H = 42;      // altezza "tutti gli articoli"
const BOTTOM_PADDING = 50; // spazio visivo sotto il link (px)

function SidebarCard({ post }: { post: BlogPost }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [transform, setTransform] = useState("translateY(-100%)");
  const [transition, setTransition] = useState("none");

  const handleEnter = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("none");
    setTransform(offscreen[dir]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTransition("transform 0.35s ease");
      setTransform("translate(0,0)");
      setHovered(true);
    }));
  };

  const handleLeave = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("transform 0.35s ease");
    setTransform(offscreen[dir]);
    setHovered(false);
  };

  return (
    <Link
      ref={ref}
      href={`/blog/${post.slug}`}
      className="relative overflow-hidden bg-cs-charcoal block shrink-0"
      style={{ height: MIN_CARD_H }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {post.featured_image_url && (
        <img
          src={post.featured_image_url}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)", transition: "transform 0.5s ease" }}
        />
      )}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(163,211,156,0.38)", transform, transition }} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
      <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <h3 className="text-white font-title font-semibold text-[26px] leading-snug drop-shadow text-center line-clamp-3">{post.title}</h3>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-1.5 pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <p className="text-white text-[11px] font-title uppercase tracking-widest drop-shadow">{formatBlogDateShort(post.date)}</p>
      </div>
    </Link>
  );
}

export default function BlogSidebarCards({ posts }: { posts: BlogPost[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Misura la colonna sinistra (fratello precedente), non la sidebar stessa
    const leftCol = el.previousElementSibling as HTMLElement | null;
    if (!leftCol) return;
    const update = () => {
      const available = leftCol.clientHeight - LINK_H - BOTTOM_PADDING;
      const n = Math.floor((available + CARD_GAP) / (MIN_CARD_H + CARD_GAP));
      setCount(Math.max(1, Math.min(n + 1, posts.length)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(leftCol);
    return () => ro.disconnect();
  }, [posts.length]);

  return (
    <div ref={containerRef} className="hidden sm:flex flex-col w-[38%] shrink-0" style={{ gap: CARD_GAP }}>
      {posts.slice(0, count).map((post) => (
        <SidebarCard key={post.id} post={post} />
      ))}
      <div style={{ paddingTop: BOTTOM_PADDING }}>
        <Link href="/blog" className="block text-center text-[11px] font-title uppercase tracking-widest text-brand-navy hover:text-[#8ac893] transition-colors py-1">
          → tutti gli articoli
        </Link>
      </div>
    </div>
  );
}
