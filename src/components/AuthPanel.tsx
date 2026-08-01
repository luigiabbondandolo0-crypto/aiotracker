"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

/* ── Animated financial chart canvas ──────────────────────────────── */
function FinanceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const el = canvas; // non-null ref for closures
    const ctx = el.getContext("2d")!;
    let raf: number;
    let t = 0;
    let W = 0;
    let H = 0;
    let points: { x: number; y: number }[] = [];
    let dots: { x: number; y: number; o: number }[] = [];

    function setup() {
      const parent = el.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      W = r.width;
      H = r.height;
      el.width = W;
      el.height = H;

      points = Array.from({ length: 60 }, (_, i) => ({
        x: (i / 59) * W,
        y: H * 0.55 + Math.sin(i * 0.3) * H * 0.12 + Math.sin(i * 0.07) * H * 0.08,
      }));

      dots = [];
      for (let x = 0; x < W; x += 18)
        for (let y = 0; y < H; y += 18)
          dots.push({ x, y, o: Math.random() * 0.22 + 0.05 });
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      if (!W || !H) return;

      ctx.clearRect(0, 0, W, H);

      // Dot grid
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(144,202,249,${d.o})`;
        ctx.fill();
      }

      // Animated chart line — draws once, slow rise
      const prog = Math.min(t / 240, 1);
      const vis = Math.floor(prog * points.length);
      if (vis > 1) {
        const visible = points.slice(0, vis);
        const last = visible[visible.length - 1];

        // Fill under line
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "rgba(124,77,255,0.22)");
        grad.addColorStop(1, "rgba(124,77,255,0)");
        ctx.beginPath();
        ctx.moveTo(visible[0].x, H);
        for (const p of visible) ctx.lineTo(p.x, p.y);
        ctx.lineTo(last.x, H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        visible.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        );
        ctx.strokeStyle = "rgba(124,77,255,0.75)";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Moving dot + glow
        ctx.beginPath();
        ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124,77,255,0.28)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#7c4dff";
        ctx.fill();
      }

      t++; // no reset — draw once
    }

    const ro = new ResizeObserver(() => { setup(); t = 0; });
    if (el.parentElement) ro.observe(el.parentElement);
    setup();
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ── Left branding panel ──────────────────────────────────────────── */
export function AuthLeftPanel({ subtitle }: { subtitle?: string }) {
  return (
    <div
      className="hidden md:block relative"
      style={{
        width: "45%",
        flexShrink: 0,
        background: "linear-gradient(160deg, #161d35 0%, #1a223f 100%)",
        borderRight: "1px solid #29314f",
      }}
    >
      {/* Canvas fills entire panel */}
      <FinanceCanvas />

      {/* Content overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ marginBottom: "16px" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #5e35b1, #7c4dff)",
              boxShadow: "0 6px 24px rgba(94,53,177,0.5)",
            }}
          >
            <Zap size={22} color="white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{ fontSize: "26px", fontWeight: 700, color: "#d7dcec", margin: "0 0 8px" }}
        >
          AIO Tracker
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ fontSize: "13px", color: "#8492c4", maxWidth: "220px", lineHeight: 1.6, margin: 0 }}
        >
          {subtitle ?? "Il tuo workspace finanziario all-in-one"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ display: "flex", gap: "28px", marginTop: "36px" }}
        >
          {[
            { label: "Portafogli", value: "∞" },
            { label: "Sicurezza", value: "A+" },
            { label: "Uptime", value: "99.9%" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#90caf9", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "11px", color: "#4a5280", margin: 0 }}>{s.label}</p>
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
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "#111936",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "30%", left: "20%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, #2196f3, transparent)",
          filter: "blur(80px)", opacity: 0.035,
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "20%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, #7c4dff, transparent)",
          filter: "blur(80px)", opacity: 0.035,
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          maxWidth: "820px",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          background: "#1a223f",
          border: "1px solid #29314f",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          minHeight: "560px",
          position: "relative",
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
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 44px",
      }}
    >
      {children}
    </div>
  );
}
