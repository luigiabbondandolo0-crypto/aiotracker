"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Trophy, TrendingUp, BarChart2,
  LineChart, Bitcoin, Wallet, LogOut, ChevronRight,
  Zap,
} from "lucide-react";

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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 min-h-screen flex flex-col flex-shrink-0 animate-slide-in-left"
      style={{ background: "#1a223f", borderRight: "1px solid #29314f" }}>

      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid #29314f" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #5e35b1, #7c4dff)", boxShadow: "0 2px 8px rgba(94,53,177,0.4)" }}>
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none tracking-tight" style={{ color: "#d7dcec" }}>AIO Tracker</p>
            <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>Financial Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        {nav.map((section, si) => (
          <div key={section.label} className="animate-fade-in" style={{ animationDelay: `${si * 60}ms` }}>
            <p className="text-xs font-semibold uppercase px-3 mb-1.5"
              style={{ color: "#8492c4", fontSize: "11px", letterSpacing: "0.1em" }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer",
                      active
                        ? "nav-active"
                        : "hover:bg-[#212946]"
                    )}
                    style={active ? {} : { color: "#8492c4" }}
                  >
                    <Icon size={15} style={{ color: active ? "#90caf9" : "#8492c4" }} className="transition-colors" />
                    <span className="font-medium" style={{ color: active ? "#90caf9" : "#bdc8f0" }}>{item.label}</span>
                    {active && <ChevronRight size={12} className="ml-auto" style={{ color: "rgba(144,202,249,0.5)" }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-4 space-y-1" style={{ borderTop: "1px solid #29314f", paddingTop: "12px" }}>
        {session?.user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(33,150,243,0.15)", border: "1px solid rgba(33,150,243,0.25)" }}>
              <span className="text-xs font-bold" style={{ color: "#90caf9" }}>
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#d7dcec" }}>{session.user.name}</p>
              <p className="text-xs truncate" style={{ color: "#8492c4" }}>{session.user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer hover:bg-red-500/5"
          style={{ color: "#8492c4" }}
        >
          <LogOut size={14} className="group-hover:text-red-400 transition-colors" />
          <span className="font-medium group-hover:text-red-400 transition-colors">Logout</span>
        </button>
      </div>
    </aside>
  );
}
