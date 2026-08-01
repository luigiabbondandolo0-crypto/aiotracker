"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AuthCard, AuthLeftPanel, AuthRight } from "@/components/AuthPanel";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Errore del server"); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthCard>
      <AuthLeftPanel subtitle="Recupera l'accesso al tuo account" />
      <AuthRight>
        <h1 style={{ color: "#d7dcec", fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Password Dimenticata</h1>
        <p style={{ color: "#8492c4", fontSize: "13px", margin: "0 0 24px" }}>
          {sent ? "Controlla la tua email" : "Ti invieremo un link per reimpostare la password"}
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{
              background: "linear-gradient(135deg, rgba(0,230,118,0.08), rgba(0,230,118,0.04))",
              border: "1px solid rgba(0,230,118,0.25)",
              borderRadius: "16px",
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📬</div>
            <p style={{ color: "#69f0ae", fontWeight: 700, fontSize: "15px", margin: "0 0 6px" }}>Email inviata!</p>
            <p style={{ color: "#8492c4", fontSize: "13px", margin: "0 0 12px", lineHeight: 1.6 }}>
              Se <strong style={{ color: "#90caf9" }}>{email}</strong> è registrata,<br />riceverai il link a breve.
            </p>
            <p style={{ color: "#4a5280", fontSize: "11px", margin: 0 }}>Non vedi l&apos;email? Controlla la cartella spam.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#8492c4", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8492c4", pointerEvents: "none" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com" required className="input-dark pl-icon" />
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "10px", background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
                <AlertCircle size={14} style={{ color: "#ef9a9a", flexShrink: 0 }} />
                <p style={{ color: "#ef9a9a", fontSize: "13px", margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Invio...</>
              ) : <>Invia link di reset <ArrowRight size={14} /></>}
            </button>
          </form>
        )}

        <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", color: "#8492c4", marginTop: "24px", textDecoration: "none" }}>
          <ArrowLeft size={14} />
          Torna al login
        </Link>
      </AuthRight>
    </AuthCard>
  );
}
