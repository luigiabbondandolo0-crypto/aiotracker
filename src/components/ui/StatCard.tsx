"use client";

import { useEffect, useRef, useState } from "react";
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

const glowMap = {
  blue:   "hover:shadow-blue-500/10",
  green:  "hover:shadow-emerald-500/10",
  red:    "hover:shadow-red-500/10",
  purple: "hover:shadow-purple-500/10",
  yellow: "hover:shadow-yellow-500/10",
};

const borderGlowMap = {
  blue:   "rgba(59,130,246,0.2)",
  green:  "rgba(16,185,129,0.2)",
  red:    "rgba(239,68,68,0.2)",
  purple: "rgba(139,92,246,0.2)",
  yellow: "rgba(245,158,11,0.2)",
};

export function StatCard({
  label, value, sub, trend, accentColor = "#60a5fa",
  delay = 0, icon, glowColor = "blue",
}: StatCardProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "card p-5 cursor-default transition-all duration-300",
        `hover:shadow-lg ${glowMap[glowColor]}`,
        visible ? "animate-fade-in" : "opacity-0",
      )}
      style={{
        animationDelay: `${delay}ms`,
        // @ts-expect-error CSS var
        "--hover-border": borderGlowMap[glowColor],
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = borderGlowMap[glowColor];
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#1a2332";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#334155" }}>
          {label}
        </p>
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
            <span style={{ color: accentColor }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
          </div>
        )}
      </div>

      <p className="text-2xl font-bold tracking-tight mb-1 animate-count-up"
        style={{ color: accentColor, animationDelay: `${delay + 100}ms` }}>
        {value}
      </p>

      <div className="flex items-center justify-between">
        {sub && <p className="text-xs" style={{ color: "#334155" }}>{sub}</p>}
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
