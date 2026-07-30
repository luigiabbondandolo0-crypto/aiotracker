"use client";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showGlow?: boolean;
}

const colorMap: Record<string, string> = {
  blue:   "linear-gradient(90deg, #1565c0, #2196f3)",
  green:  "linear-gradient(90deg, #00b248, #00e676)",
  red:    "linear-gradient(90deg, #c62828, #f44336)",
  yellow: "linear-gradient(90deg, #f9a825, #ffc107)",
  purple: "linear-gradient(90deg, #4527a0, #7c4dff)",
};

const glowMap: Record<string, string> = {
  blue:   "rgba(33,150,243,0.5)",
  green:  "rgba(0,230,118,0.5)",
  red:    "rgba(244,67,54,0.5)",
  yellow: "rgba(255,193,7,0.5)",
  purple: "rgba(124,77,255,0.5)",
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
