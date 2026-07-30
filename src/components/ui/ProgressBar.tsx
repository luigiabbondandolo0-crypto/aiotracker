"use client";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showGlow?: boolean;
}

const colorMap: Record<string, string> = {
  blue:   "linear-gradient(90deg, #2563eb, #3b82f6)",
  green:  "linear-gradient(90deg, #059669, #10b981)",
  red:    "linear-gradient(90deg, #dc2626, #ef4444)",
  yellow: "linear-gradient(90deg, #d97706, #f59e0b)",
  purple: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
};

const glowMap: Record<string, string> = {
  blue:   "rgba(59,130,246,0.5)",
  green:  "rgba(16,185,129,0.5)",
  red:    "rgba(239,68,68,0.5)",
  yellow: "rgba(245,158,11,0.5)",
  purple: "rgba(139,92,246,0.5)",
};

export function ProgressBar({ value, color = "blue", height = 6, showGlow = true }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const gradient = colorMap[color] ?? colorMap.blue;
  const glow = glowMap[color] ?? glowMap.blue;

  return (
    <div
      className="progress-track"
      style={{ height }}
    >
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
