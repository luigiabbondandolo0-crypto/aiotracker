"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { AuthCard, AuthLeftPanel, AuthRight } from "@/components/AuthPanel";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard>
      <AuthLeftPanel subtitle="Accedi al tuo workspace finanziario" />
      <AuthRight>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#d7dcec" }}>Bentornato</h1>
        <p className="text-sm mb-6" style={{ color: "#8492c4" }}>Inserisci le tue credenziali per accedere</p>

        {registered && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 animate-fade-in"
            style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.2)" }}>
            <CheckCircle size={14} className="flex-shrink-0" style={{ color: "#69f0ae" }} />
            <p className="text-sm" style={{ color: "#69f0ae" }}>Account creato. Accedi ora.</p>
          </div>
        )}
        {reset && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 animate-fade-in"
            style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.2)" }}>
            <CheckCircle size={14} className="flex-shrink-0" style={{ color: "#69f0ae" }} />
            <p className="text-sm" style={{ color: "#69f0ae" }}>Password aggiornata. Accedi ora.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com" required className="input-dark pl-10 w-full" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>Password</label>
              <Link href="/forgot-password" className="text-xs transition" style={{ color: "#90caf9" }}>
                Password dimenticata?
              </Link>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8492c4" }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required className="input-dark pl-10 pr-10 w-full" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8492c4" }} tabIndex={-1}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
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
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Accesso...</>
            ) : (
              <>Accedi <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#8492c4" }}>
          Non hai un account?{" "}
          <Link href="/register" className="font-medium transition" style={{ color: "#90caf9" }}>Registrati gratis</Link>
        </p>
      </AuthRight>
    </AuthCard>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
