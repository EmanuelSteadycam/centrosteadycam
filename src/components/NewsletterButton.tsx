"use client";
import { useState } from "react";
import NewsletterModal from "./NewsletterModal";

export default function NewsletterButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#8ac893] text-[#1e1e1e] text-xs font-title uppercase tracking-[0.12em] hover:bg-[#6db577] transition-colors rounded-full"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="7" y1="8"  x2="17" y2="8"/>
          <line x1="7" y1="12" x2="17" y2="12"/>
          <line x1="7" y1="16" x2="13" y2="16"/>
        </svg>
        Iscriviti
      </button>
      {open && <NewsletterModal onClose={() => setOpen(false)} />}
    </>
  );
}
