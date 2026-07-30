"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Zap, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Debole", "Media", "Forte"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #10b981, transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in-scale">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 0 24px rgba(16,185,129,0.1)" }}>
            <Zap size={20} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crea Account</h1>
          <p className="text-sm mt-1" style={{ color: "#475569" }}>Inizia a tracciare le tue finanze</p>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid #1a2332", borderRadius: "20px", padding: "28px" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>Nome</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Mario Rossi" required className="input-dark pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com" required className="input-dark pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caratteri" required minLength={8} className="input-dark pl-10" />
              </div>
              {password && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: passwordStrength >= i ? strengthColors[passwordStrength] : "#1a2332" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>{strengthLabels[passwordStrength]}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: loading ? "none" : "0 0 20px rgba(16,185,129,0.25)" }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Registrazione...
                </span>
              ) : (
                <>Crea Account <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 space-y-2" style={{ borderTop: "1px solid #1a2332" }}>
            {["Dati protetti e privati", "Nessuna carta di credito richiesta", "Cancella quando vuoi"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                <p className="text-xs" style={{ color: "#475569" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#334155" }}>
          Hai già un account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
