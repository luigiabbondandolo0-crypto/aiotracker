"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "⬛" },
    ],
  },
  {
    label: "Trading",
    items: [
      { href: "/prop-firm", label: "Prop Firm", icon: "🏆" },
      { href: "/trading", label: "Trading Personale", icon: "📈" },
    ],
  },
  {
    label: "Investimenti",
    items: [
      { href: "/etf", label: "ETF & PAC", icon: "📊" },
      { href: "/stocks", label: "Azioni", icon: "💹" },
      { href: "/crypto", label: "Crypto", icon: "₿" },
    ],
  },
  {
    label: "Finanze",
    items: [
      { href: "/budget", label: "Budget & Spese", icon: "💰" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#0d1117] border-r border-[#1e2a3a] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e2a3a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 font-bold text-sm">A</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">AIO Tracker</p>
            <p className="text-slate-500 text-xs mt-0.5">Financial Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {nav.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                      active
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1e2a3a]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="text-base leading-none">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
