"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Zap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in-scale">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 0 24px rgba(59,130,246,0.1)" }}>
            <Zap size={20} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AIO Tracker</h1>
          <p className="text-sm mt-1" style={{ color: "#475569" }}>Accedi al tuo workspace finanziario</p>
        </div>

        {/* Card */}
        <div style={{ background: "#0d1117", border: "1px solid #1a2332", borderRadius: "20px", padding: "28px" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  required
                  className="input-dark pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Accesso...
                </span>
              ) : (
                <>Accedi <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#334155" }}>
          Non hai un account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 transition font-medium">
            Registrati gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
