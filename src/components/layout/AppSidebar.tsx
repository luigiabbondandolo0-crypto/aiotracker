"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Trophy, TrendingUp, BarChart2, LineChart, Bitcoin, Wallet, LogOut, Zap, ChevronRight } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const nav = [
  { label: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Trading", items: [{ href: "/prop-firm", label: "Prop Firm", icon: Trophy }, { href: "/trading", label: "Trading", icon: TrendingUp }] },
  { label: "Investimenti", items: [{ href: "/etf", label: "ETF & PAC", icon: BarChart2 }, { href: "/stocks", label: "Azioni", icon: LineChart }, { href: "/crypto", label: "Crypto", icon: Bitcoin }] },
  { label: "Finanze", items: [{ href: "/budget", label: "Budget & Spese", icon: Wallet }] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { visible, setVisible } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay${visible ? " sidebar-overlay-visible" : ""}`} onClick={() => setVisible(false)} />

      <aside className={`app-sidebar${visible ? " sidebar-visible" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={15} color="white" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">AIO Tracker</span>
            <span className="sidebar-brand-sub">Financial Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav-wrapper">
          {nav.map((section) => (
            <div key={section.label} className="sidebar-section">
              <span className="sidebar-section-label">{section.label}</span>
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`sidebar-nav-link${active ? " active" : ""}`}
                    onClick={() => setVisible(false)}>
                    <Icon size={15} className="sidebar-nav-icon" />
                    <span className="sidebar-nav-label">{item.label}</span>
                    {active && <ChevronRight size={12} className="sidebar-nav-chevron" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer-area">
          {session?.user && (
            <div className="sidebar-user-row">
              <div className="sidebar-avatar">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{session.user.name}</span>
                <span className="sidebar-user-email">{session.user.email}</span>
              </div>
            </div>
          )}
          <button className="sidebar-logout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
