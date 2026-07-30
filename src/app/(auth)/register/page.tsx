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
  const strengthColors = ["", "#f44336", "#ffc107", "#00e676"];
  const strengthLabels = ["", "Debole", "Media", "Forte"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 40% 20%, rgba(124,77,255,0.08) 0%, #111936 60%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #00e676, transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #2196f3, transparent)", filter: "blur(60px)" }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in-scale">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #5e35b1, #7c4dff)", boxShadow: "0 4px 16px rgba(94,53,177,0.4)" }}>
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#d7dcec" }}>Crea Account</h1>
          <p className="text-sm mt-1" style={{ color: "#8492c4" }}>Inizia a tracciare le tue finanze</p>
        </div>

        <div style={{ background: "#1a223f", border: "1px solid #29314f", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Nome</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8492c4" }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Mario Rossi" required className="input-dark pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8492c4" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com" required className="input-dark pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8492c4" }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8492c4" }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caratteri" required minLength={8} className="input-dark pl-10" />
              </div>
              {password && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: passwordStrength >= i ? strengthColors[passwordStrength] : "#29314f" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>{strengthLabels[passwordStrength]}</p>
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

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #5e35b1, #7c4dff)", boxShadow: loading ? "none" : "0 4px 16px rgba(94,53,177,0.4)" }}>
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

          <div className="mt-5 pt-4 space-y-2" style={{ borderTop: "1px solid #29314f" }}>
            {["Dati protetti e privati", "Nessuna carta di credito richiesta", "Cancella quando vuoi"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={12} className="flex-shrink-0" style={{ color: "#00e676" }} />
                <p className="text-xs" style={{ color: "#8492c4" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#8492c4" }}>
          Hai già un account?{" "}
          <Link href="/login" className="font-medium transition" style={{ color: "#90caf9" }}>Accedi</Link>
        </p>
      </div>
    </div>
  );
}
