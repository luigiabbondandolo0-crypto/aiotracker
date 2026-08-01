"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  accentColor?: string;
  delay?: number;
  icon?: React.ReactNode;
  glowColor?: "blue" | "green" | "red" | "purple" | "yellow";
}

const borderGlowMap = {
  blue:   "rgba(59,130,246,0.35)",
  green:  "rgba(16,185,129,0.35)",
  red:    "rgba(239,68,68,0.35)",
  purple: "rgba(124,58,237,0.35)",
  yellow: "rgba(245,158,11,0.35)",
};

const iconBgMap = {
  blue:   { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)" },
  green:  { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)" },
  red:    { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)" },
  purple: { bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.2)" },
  yellow: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
};

export function StatCard({
  label, value, sub, trend, accentColor = "#93C5FD",
  delay = 0, icon, glowColor = "blue",
}: StatCardProps) {
  const [visible, setVisible] = useState(false);
  const iconColors = iconBgMap[glowColor];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "card p-5 cursor-default transition-all duration-300",
        visible ? "animate-fade-in" : "opacity-0",
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = borderGlowMap[glowColor];
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${borderGlowMap[glowColor]}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748B" }}>
          {label}
        </p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: iconColors.bg, border: `1px solid ${iconColors.border}` }}
          >
            <span style={{ color: accentColor }} className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          </div>
        )}
      </div>

      <p
        className="text-2xl font-bold tracking-tight mb-1 animate-count-up"
        style={{ color: accentColor, animationDelay: `${delay + 100}ms`, letterSpacing: "-0.03em" }}
      >
        {value}
      </p>

      <div className="flex items-center justify-between">
        {sub && <p className="text-xs" style={{ color: "#64748B" }}>{sub}</p>}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium badge",
            trend > 0 ? "badge-green" : trend < 0 ? "badge-red" : "badge-blue"
          )}>
            {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
