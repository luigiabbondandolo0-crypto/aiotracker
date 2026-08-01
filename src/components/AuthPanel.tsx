"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

/* ── Animated financial chart background ─────────────────────────── */
function FinanceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });
    ro.observe(canvas.parentElement as Element);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    let raf: number;
    let t = 0;

    // Generate a fake chart path
    const points = Array.from({ length: 60 }, (_, i) => ({
      x: (i / 59) * width,
      y:
        height * 0.55 +
        Math.sin(i * 0.3) * height * 0.12 +
        Math.sin(i * 0.07) * height * 0.08,
    }));

    // Dot grid
    const dots: { x: number; y: number; opacity: number }[] = [];
    for (let x = 0; x < width; x += 18) {
      for (let y = 0; y < height; y += 18) {
        dots.push({ x, y, opacity: Math.random() * 0.25 + 0.05 });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Dots
      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(144,202,249,${d.opacity})`;
        ctx.fill();
      });

      // Chart line (animated draw)
      const progress = Math.min(t / 120, 1);
      const visible = Math.floor(progress * points.length);
      if (visible > 1) {
        // Gradient fill under chart
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "rgba(124,77,255,0.18)");
        grad.addColorStop(1, "rgba(124,77,255,0)");
        ctx.beginPath();
        ctx.moveTo(points[0].x, height);
        points.slice(0, visible).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[visible - 1].x, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        points.slice(0, visible).forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        );
        ctx.strokeStyle = "rgba(124,77,255,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Moving dot
        const last = points[visible - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#7c4dff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124,77,255,0.3)";
        ctx.fill();
      }

      t++;
      if (t > 300) t = 0; // loop
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

/* ── Left branding panel ──────────────────────────────────────────── */
export function AuthLeftPanel({ subtitle }: { subtitle?: string }) {
  return (
    <div
      className="hidden md:flex md:w-1/2 h-full relative flex-col items-center justify-center p-10 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #161d35 0%, #1a223f 100%)",
        borderRight: "1px solid #29314f",
      }}
    >
      <FinanceCanvas />
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #5e35b1, #7c4dff)",
              boxShadow: "0 6px 24px rgba(94,53,177,0.5)",
            }}
          >
            <Zap size={24} className="text-white" />
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-3xl font-bold mb-2"
          style={{ color: "#d7dcec" }}
        >
          AIO Tracker
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-sm max-w-xs mx-auto"
          style={{ color: "#8492c4" }}
        >
          {subtitle ?? "Il tuo workspace finanziario all-in-one"}
        </motion.p>

        {/* Stats decorations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex gap-6 justify-center mt-8"
        >
          {[
            { label: "Portafogli", value: "∞" },
            { label: "Sicurezza", value: "A+" },
            { label: "Uptime", value: "99.9%" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold" style={{ color: "#90caf9" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "#4a5280" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Card wrapper ─────────────────────────────────────────────────── */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#111936" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #2196f3, transparent)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #7c4dff, transparent)", filter: "blur(80px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl overflow-hidden rounded-2xl flex shadow-2xl relative"
        style={{
          background: "#1a223f",
          border: "1px solid #29314f",
          minHeight: "520px",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Right form panel ─────────────────────────────────────────────── */
export function AuthRight({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-10">
      {children}
    </div>
  );
}
