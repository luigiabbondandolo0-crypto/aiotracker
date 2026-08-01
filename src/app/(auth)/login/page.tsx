"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { AuthCard, AuthLeftPanel, AuthRight } from "@/components/AuthPanel";

function SuccessBanner({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)",
        border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: "12px",
        padding: "14px 16px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
      <div>
        <p style={{ color: "#6EE7B7", fontWeight: 600, fontSize: "13px", margin: 0 }}>{title}</p>
        <p style={{ color: "#64748B", fontSize: "12px", margin: "2px 0 0" }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

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
        <h1 style={{ color: "#F1F5F9", fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Bentornato</h1>
        <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 24px" }}>Inserisci le tue credenziali per accedere</p>

        {registered && (
          <SuccessBanner icon="🎉" title="Account creato con successo!" subtitle="Effettua l'accesso per iniziare." />
        )}
        {reset && (
          <SuccessBanner icon="🔐" title="Password aggiornata!" subtitle="Accedi con la tua nuova password." />
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#64748B", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                required
                className="input-dark pl-icon"
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ color: "#64748B", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ color: "#93C5FD", fontSize: "12px", textDecoration: "none" }}>
                Password dimenticata?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-dark pl-icon-pr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} style={{ color: "#FCA5A5", flexShrink: 0 }} />
              <p style={{ color: "#FCA5A5", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Accesso...</>
            ) : (
              <>Accedi <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B", marginTop: "24px" }}>
          Non hai un account?{" "}
          <Link href="/register" style={{ color: "#93C5FD", fontWeight: 500, textDecoration: "none" }}>Registrati gratis</Link>
        </p>
      </AuthRight>
    </AuthCard>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
