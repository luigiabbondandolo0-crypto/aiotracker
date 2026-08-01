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
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

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
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#d7dcec" }}>Nuova Password</h1>
        <p className="text-sm mb-6" style={{ color: "#8492c4" }}>Inserisci la tua nuova password</p>

        {!token ? (
          <div className="text-center py-4">
            <p className="text-sm mb-3" style={{ color: "#ef9a9a" }}>Link non valido o scaduto.</p>
            <Link href="/forgot-password" style={{ color: "#90caf9" }} className="text-sm font-medium">
              Richiedi un nuovo link →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Nuova Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caratteri" required className="input-dark pl-10 pr-10 w-full" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8492c4" }} tabIndex={-1}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength.score >= i ? strength.color : "#29314f" }} />
                    ))}
                  </div>
                  {strength.label && <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>}
                  <div className="space-y-1">
                    {CHECKS.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <CheckCircle size={11} style={{ color: strength.checks[key] ? "#00e676" : "#29314f" }} />
                        <span className="text-xs" style={{ color: strength.checks[key] ? "#8492c4" : "#4a5280" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
                <AlertCircle size={14} className="flex-shrink-0" style={{ color: "#ef9a9a" }} />
                <p className="text-sm" style={{ color: "#ef9a9a" }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !isValid}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{
                marginTop: "8px",
                opacity: !isValid && password.length > 0 ? 0.5 : 1,
              }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Salvataggio...</>
              ) : (
                <>Salva Password <ArrowRight size={14} /></>
              )}
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
