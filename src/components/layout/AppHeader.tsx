"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const PAGE_INFO: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard", sub: "Panoramica portfolio" },
  "/prop-firm": { title: "Prop Firm", sub: "Account finanziati" },
  "/trading":   { title: "Trading", sub: "Account trading personali" },
  "/etf":       { title: "ETF & PAC", sub: "Piani di accumulo" },
  "/stocks":    { title: "Azioni", sub: "Portfolio azionario" },
  "/crypto":    { title: "Crypto", sub: "Holdings crypto" },
  "/budget":    { title: "Budget & Spese", sub: "Entrate e spese mensili" },
};

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const info = PAGE_INFO[pathname] ?? { title: "Dashboard", sub: "" };

  return (
    <header className="app-header">
      <button className="header-hamburger" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <div className="header-page-info">
        <span className="header-page-title">{info.title}</span>
        {info.sub && <span className="header-page-sub">{info.sub}</span>}
      </div>
      {session?.user && (
        <div className="header-user-pill">
          <div className="header-user-avatar">
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="header-user-name">{session.user.name}</span>
        </div>
      )}
    </header>
  );
}
