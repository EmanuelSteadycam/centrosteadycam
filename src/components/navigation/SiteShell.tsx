"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SiteSwitcherPill from "@/components/SiteSwitcherPill";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin   = pathname.startsWith("/admin");
  const isDisplay = pathname.startsWith("/display");
  const isHome    = pathname === "/";

  return (
    <>
      {/* Pill — sempre montato su tutte le pagine non-admin */}
      {!isAdmin && (
        <div className="fixed top-[50px] left-6 z-[51] hidden md:block">
          <SiteSwitcherPill
            active={isDisplay ? 1 : 0}
            collapsed={!isHome && !isDisplay}
            indicatorColor="#a3d39c"
            pillBg="rgba(160,160,160,0.45)"
            textColor="rgba(255,255,255,0.6)"
            activeTextColor="#1d1d1f"
          />
        </div>
      )}

      {isAdmin || isDisplay ? (
        <>{children}</>
      ) : (
        <>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
