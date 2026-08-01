"use client";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showGlow?: boolean;
}

const colorMap: Record<string, string> = {
  blue:   "linear-gradient(90deg, #1D4ED8, #3B82F6)",
  green:  "linear-gradient(90deg, #059669, #10B981)",
  red:    "linear-gradient(90deg, #B91C1C, #EF4444)",
  yellow: "linear-gradient(90deg, #B45309, #F59E0B)",
  purple: "linear-gradient(90deg, #6D28D9, #7C3AED)",
};

const glowMap: Record<string, string> = {
  blue:   "rgba(59,130,246,0.45)",
  green:  "rgba(16,185,129,0.45)",
  red:    "rgba(239,68,68,0.45)",
  yellow: "rgba(245,158,11,0.45)",
  purple: "rgba(124,58,237,0.45)",
};

export function ProgressBar({ value, color = "blue", height = 6, showGlow = true }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const gradient = colorMap[color] ?? colorMap.blue;
  const glow = glowMap[color] ?? glowMap.blue;

  return (
    <div className="progress-track" style={{ height }}>
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          background: gradient,
          boxShadow: showGlow ? `0 0 8px ${glow}` : "none",
        }}
      />
    </div>
  );
}
