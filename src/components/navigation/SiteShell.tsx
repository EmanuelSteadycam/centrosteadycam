"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SiteSwitcherPill from "@/components/SiteSwitcherPill";

function useScrollVisible(topOnly = false) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 50) setVisible(true);
      else if (topOnly) setVisible(false);
      else if (y > lastY.current) setVisible(false);
      else setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [topOnly]);
  return visible;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin   = pathname.startsWith("/admin");
  const isDisplay = pathname.startsWith("/display");
  const isHome     = pathname === "/";
  const isArchivio = pathname.startsWith("/archivio");
  const visible    = useScrollVisible(isArchivio);

  return (
    <>
      {/* Pill — sempre montato su tutte le pagine non-admin */}
      {!isAdmin && (
        <div
          className="fixed top-[35px] left-6 z-[51] hidden md:block"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            pointerEvents: visible ? "auto" : "none",
          }}
        >
          <SiteSwitcherPill
            active={isDisplay ? 1 : 0}
            collapsed={!isHome && !isDisplay}
            indicatorColor="#a3d39c"
            pillBg="rgba(40,40,40,0.72)"
            textColor="rgba(255,255,255,0.6)"
            activeTextColor="#1d1d1f"
          />
        </div>
      )}

      {isAdmin || isDisplay ? (
        <>{children}</>
      ) : (
        <>
          <Navbar visible={visible} />
          <main>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
