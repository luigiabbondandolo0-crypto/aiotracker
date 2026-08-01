"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
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
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#d7dcec" }}>Password Dimenticata</h1>
        <p className="text-sm mb-6" style={{ color: "#8492c4" }}>
          {sent ? "Controlla la tua email" : "Ti invieremo un link per reimpostare la password"}
        </p>

        {sent ? (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.2)" }}>
                <CheckCircle size={30} style={{ color: "#00e676" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#d7dcec" }}>Email inviata!</p>
                <p className="text-sm mt-1" style={{ color: "#8492c4" }}>
                  Se <span style={{ color: "#90caf9" }}>{email}</span> è registrata,<br />riceverai il link a breve.
                </p>
              </div>
              <p className="text-xs" style={{ color: "#4a5280" }}>Non vedi l&apos;email? Controlla la cartella spam.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com" required className="input-dark pl-10 w-full" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
                <AlertCircle size={14} className="flex-shrink-0" style={{ color: "#ef9a9a" }} />
                <p className="text-sm" style={{ color: "#ef9a9a" }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2" style={{ marginTop: "8px" }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Invio...</>
              ) : (
                <>Invia link di reset <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm mt-6 transition" style={{ color: "#8492c4" }}>
          <ArrowLeft size={14} />
          Torna al login
        </Link>
      </AuthRight>
    </AuthCard>
  );
}
