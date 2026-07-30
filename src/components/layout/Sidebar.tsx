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
      style={{ background: "#080c14", borderRight: "1px solid #1a2332" }}>

      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid #1a2332" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}>
            <Zap size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none tracking-tight">AIO Tracker</p>
            <p className="text-xs mt-0.5" style={{ color: "#334155" }}>Financial Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        {nav.map((section, si) => (
          <div key={section.label} className="animate-fade-in" style={{ animationDelay: `${si * 60}ms` }}>
            <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: "#1e3a5f", letterSpacing: "0.1em" }}>
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
                        ? "nav-active text-blue-400"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
                    )}
                  >
                    <Icon size={15} className={active ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400 transition-colors"} />
                    <span className="font-medium">{item.label}</span>
                    {active && <ChevronRight size={12} className="ml-auto text-blue-400/50" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-4 space-y-1" style={{ borderTop: "1px solid #1a2332", paddingTop: "12px" }}>
        {session?.user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{session.user.name}</p>
              <p className="text-xs truncate" style={{ color: "#334155" }}>{session.user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer text-slate-600 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut size={14} className="group-hover:text-red-400 transition-colors" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
