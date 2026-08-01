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
  blue:   { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.15)" },
  green:  { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.15)" },
  red:    { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.15)" },
  purple: { bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.15)" },
  yellow: { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.15)" },
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
      className={cn("card cursor-default transition-all duration-300", visible ? "animate-fade-in" : "opacity-0")}
      style={{ animationDelay: `${delay}ms`, padding: "16px", overflow: "hidden" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = borderGlowMap[glowColor];
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${borderGlowMap[glowColor]}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", lineHeight: 1 }}>
          {label}
        </p>
        {icon && (
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: iconColors.bg, border: `1px solid ${iconColors.border}`, flexShrink: 0 }}>
            <span style={{ color: accentColor }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className="animate-count-up"
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: accentColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          animationDelay: `${delay + 100}ms`,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: "6px",
        }}
      >
        {value}
      </p>

      {/* Sub / trend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
        {sub && (
          <p style={{ fontSize: "11px", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {sub}
          </p>
        )}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium badge",
            trend > 0 ? "badge-green" : trend < 0 ? "badge-red" : "badge-blue"
          )} style={{ flexShrink: 0 }}>
            {trend > 0 ? <TrendingUp size={9} /> : trend < 0 ? <TrendingDown size={9} /> : <Minus size={9} />}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
