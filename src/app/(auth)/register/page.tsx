"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { AuthCard, AuthLeftPanel, AuthRight } from "@/components/AuthPanel";

function getStrength(pw: string) {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "", color: "#29314f" },
    1: { label: "Molto debole", color: "#f44336" },
    2: { label: "Debole", color: "#ff9800" },
    3: { label: "Buona", color: "#ffc107" },
    4: { label: "Forte", color: "#00e676" },
  };
  return { score, checks, ...map[score] };
}

const CHECKS = [
  { key: "length" as const, label: "Minimo 8 caratteri" },
  { key: "uppercase" as const, label: "Una maiuscola" },
  { key: "number" as const, label: "Un numero" },
  { key: "symbol" as const, label: "Un simbolo speciale" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const isValid = strength.score === 4;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) { setError("La password non soddisfa i requisiti di sicurezza"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Errore durante la registrazione"); setLoading(false); return; }
    router.push("/login?registered=1");
  }

  return (
    <AuthCard>
      <AuthLeftPanel subtitle="Crea il tuo account gratuito" />
      <AuthRight>
        <h1 style={{ color: "#d7dcec", fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Crea Account</h1>
        <p style={{ color: "#8492c4", fontSize: "13px", margin: "0 0 24px" }}>Inizia a tracciare le tue finanze oggi</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#8492c4", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Nome</label>
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8492c4", pointerEvents: "none" }} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi" required className="input-dark pl-icon" />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#8492c4", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8492c4", pointerEvents: "none" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com" required className="input-dark pl-icon" />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#8492c4", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8492c4", pointerEvents: "none" }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri" required className="input-dark pl-icon-pr" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#8492c4", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                tabIndex={-1}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {password && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: "3px", flex: 1, borderRadius: "2px", transition: "background 0.3s", background: strength.score >= i ? strength.color : "#29314f" }} />
                  ))}
                </div>
                {strength.label && <p style={{ color: strength.color, fontSize: "11px", fontWeight: 600, margin: "0 0 6px" }}>{strength.label}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {CHECKS.map(({ key, label }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={11} style={{ color: strength.checks[key] ? "#00e676" : "#29314f", flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: strength.checks[key] ? "#8492c4" : "#4a5280" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "10px", background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
              <AlertCircle size={14} style={{ color: "#ef9a9a", flexShrink: 0 }} />
              <p style={{ color: "#ef9a9a", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !isValid}
            className="btn-primary"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px",
              background: "linear-gradient(135deg, #5e35b1, #7c4dff)",
              boxShadow: loading || !isValid ? "none" : "0 4px 16px rgba(94,53,177,0.4)",
              opacity: !isValid && password.length > 0 ? 0.5 : 1,
            }}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Registrazione...</>
            ) : <>Crea Account <ArrowRight size={14} /></>}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #29314f", display: "flex", flexDirection: "column", gap: "8px" }}>
          {["Dati protetti e privati", "Nessuna carta di credito richiesta", "Cancella quando vuoi"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={12} style={{ color: "#00e676", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "#8492c4", margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#8492c4", marginTop: "16px" }}>
          Hai già un account?{" "}
          <Link href="/login" style={{ color: "#90caf9", fontWeight: 500, textDecoration: "none" }}>Accedi</Link>
        </p>
      </AuthRight>
    </AuthCard>
  );
}
