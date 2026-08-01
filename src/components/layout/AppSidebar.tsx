"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CNavTitle,
  CNavItem,
  CNavLink,
} from "@coreui/react";
import {
  LayoutDashboard, Trophy, TrendingUp, BarChart2,
  LineChart, Bitcoin, Wallet, LogOut, Zap,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const nav = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Trading",
    items: [
      { href: "/prop-firm", label: "Prop Firm", icon: Trophy },
      { href: "/trading", label: "Trading", icon: TrendingUp },
    ],
  },
  {
    label: "Investimenti",
    items: [
      { href: "/etf", label: "ETF & PAC", icon: BarChart2 },
      { href: "/stocks", label: "Azioni", icon: LineChart },
      { href: "/crypto", label: "Crypto", icon: Bitcoin },
    ],
  },
  {
    label: "Finanze",
    items: [
      { href: "/budget", label: "Budget & Spese", icon: Wallet },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { visible, setVisible } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {visible && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setVisible(false)}
        />
      )}

      <CSidebar
        colorScheme="dark"
        visible={visible}
        onVisibleChange={setVisible}
        className="app-sidebar"
      >
        {/* Brand */}
        <CSidebarBrand className="app-sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={15} style={{ color: "white" }} />
          </div>
          <div className="sidebar-brand-text">
            <p className="sidebar-brand-name">AIO Tracker</p>
            <p className="sidebar-brand-sub">Financial Hub</p>
          </div>
        </CSidebarBrand>

        {/* Navigation */}
        <CSidebarNav>
          {nav.map((section) => (
            <div key={section.label}>
              <CNavTitle>{section.label}</CNavTitle>
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <CNavItem key={item.href}>
                    <CNavLink
                      as={Link as React.ElementType}
                      href={item.href}
                      active={active}
                    >
                      <Icon size={15} className="nav-icon" style={{ color: active ? "#90caf9" : "#8492c4" }} />
                      {item.label}
                    </CNavLink>
                  </CNavItem>
                );
              })}
            </div>
          ))}
        </CSidebarNav>

        {/* User + Logout */}
        <div className="sidebar-footer">
          {session?.user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{session.user.name}</p>
                <p className="sidebar-user-email">{session.user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="sidebar-logout-btn"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>

        <CSidebarToggler />
      </CSidebar>
    </>
  );
}
