"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
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

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
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
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Errore del server"); setLoading(false); return; }
    router.push("/login?reset=1");
  }

  return (
    <AuthCard>
      <AuthLeftPanel subtitle="Scegli una nuova password sicura" />
      <AuthRight>
        <h1 style={{ color: "#d7dcec", fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Nuova Password</h1>
        <p style={{ color: "#8492c4", fontSize: "13px", margin: "0 0 24px" }}>Inserisci la tua nuova password</p>

        {!token ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "#ef9a9a", fontSize: "13px", marginBottom: "12px" }}>Link non valido o scaduto.</p>
            <Link href="/forgot-password" style={{ color: "#90caf9", fontSize: "13px", fontWeight: 500 }}>
              Richiedi un nuovo link →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#8492c4", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Nuova Password</label>
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

            <button type="submit" disabled={loading || !isValid} className="btn-primary"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px",
                opacity: !isValid && password.length > 0 ? 0.5 : 1,
              }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Salvataggio...</>
              ) : <>Salva Password <ArrowRight size={14} /></>}
            </button>
          </form>
        )}
      </AuthRight>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
