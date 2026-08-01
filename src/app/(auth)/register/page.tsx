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
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#d7dcec" }}>Crea Account</h1>
        <p className="text-sm mb-6" style={{ color: "#8492c4" }}>Inizia a tracciare le tue finanze oggi</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Nome</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi" required className="input-dark pl-10 w-full" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com" required className="input-dark pl-10 w-full" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Password</label>
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
              background: "linear-gradient(135deg, #5e35b1, #7c4dff)",
              boxShadow: loading || !isValid ? "none" : "0 4px 16px rgba(94,53,177,0.4)",
              opacity: !isValid && password.length > 0 ? 0.5 : 1,
            }}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Registrazione...</>
            ) : (
              <>Crea Account <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 space-y-2" style={{ borderTop: "1px solid #29314f" }}>
          {["Dati protetti e privati", "Nessuna carta di credito richiesta", "Cancella quando vuoi"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle size={12} className="flex-shrink-0" style={{ color: "#00e676" }} />
              <p className="text-xs" style={{ color: "#8492c4" }}>{item}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "#8492c4" }}>
          Hai già un account?{" "}
          <Link href="/login" className="font-medium transition" style={{ color: "#90caf9" }}>Accedi</Link>
        </p>
      </AuthRight>
    </AuthCard>
  );
}
