"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CHeader, CHeaderToggler, CHeaderNav, CContainer } from "@coreui/react";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/prop-firm": "Prop Firm",
  "/trading": "Trading",
  "/etf": "ETF & PAC",
  "/stocks": "Azioni",
  "/crypto": "Crypto",
  "/budget": "Budget & Spese",
};

const PAGE_SUBS: Record<string, string> = {
  "/dashboard": "Panoramica portfolio",
  "/prop-firm": "Account finanziati",
  "/trading": "Account trading",
  "/etf": "Piani di accumulo",
  "/stocks": "Portfolio azionario",
  "/crypto": "Holdings crypto",
  "/budget": "Entrate e spese",
};

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";
  const sub = PAGE_SUBS[pathname] ?? "";

  return (
    <CHeader position="sticky" className="app-header">
      <CContainer fluid>
        <CHeaderToggler className="header-toggler-btn" onClick={toggleSidebar}>
          <Menu size={18} />
        </CHeaderToggler>

        <div className="header-page-info">
          <h2 className="header-page-title">{title}</h2>
          {sub && <p className="header-page-sub">{sub}</p>}
        </div>

        <CHeaderNav className="header-actions">
          {session?.user && (
            <div className="header-user-pill">
              <div className="header-user-avatar">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="header-user-name">{session.user.name}</span>
            </div>
          )}
        </CHeaderNav>
      </CContainer>
    </CHeader>
  );
}
