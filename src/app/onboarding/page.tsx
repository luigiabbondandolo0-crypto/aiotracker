"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, ArrowLeft, Check,
  TrendingUp, BarChart2, PieChart, Bitcoin, Briefcase, Wallet,
  Globe, Percent, CheckCircle,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */
interface Prefs {
  sections: string[];
  taxRegion: string;
  taxRate: number;
  budgetRule: string;
  budgetCustom: { needs: number; wants: number; savings: number };
}

const TOTAL_STEPS = 4;

/* ── Section options ────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "propFirm", label: "Prop Firm", desc: "Challenge e account finanziati", icon: Briefcase, color: "#7C3AED" },
  { id: "trading", label: "Trading Personale", desc: "Forex, indici, materie prime", icon: TrendingUp, color: "#3B82F6" },
  { id: "etf", label: "ETF & Fondi", desc: "Investimento passivo a lungo termine", icon: BarChart2, color: "#10B981" },
  { id: "stocks", label: "Azioni", desc: "Portafoglio azionario", icon: PieChart, color: "#F59E0B" },
  { id: "crypto", label: "Criptovalute", desc: "BTC, ETH e altcoin", icon: Bitcoin, color: "#ff9800" },
  { id: "budget", label: "Budget & Spese", desc: "Entrate, uscite e risparmio", icon: Wallet, color: "#e91e63" },
];

const BUDGET_RULES = [
  { id: "503020", label: "50/30/20", desc: "Necessità · Desideri · Risparmio", values: { needs: 50, wants: 30, savings: 20 } },
  { id: "702010", label: "70/20/10", desc: "Spese · Risparmio · Investimenti", values: { needs: 70, wants: 20, savings: 10 } },
  { id: "custom", label: "Personalizzato", desc: "Imposta le tue percentuali", values: null },
];

/* ── Step components ────────────────────────────────────────────────── */
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ fontSize: "56px", marginBottom: "20px" }}>👋</motion.div>
      <h2 style={{ color: "#F1F5F9", fontSize: "26px", fontWeight: 700, margin: "0 0 10px" }}>
        Benvenuto in AIO Tracker!
      </h2>
      <p style={{ color: "#64748B", fontSize: "14px", lineHeight: 1.7, margin: "0 0 32px", maxWidth: "360px", marginInline: "auto" }}>
        Ci vogliono <strong style={{ color: "#93C5FD" }}>2 minuti</strong> per personalizzare la tua esperienza
        e configurare le sezioni che ti interessano.
      </p>
      <button onClick={onNext} style={btnStyle("#7C3AED")}>
        Iniziamo <ArrowRight size={16} />
      </button>
    </div>
  );
}

function StepSections({ prefs, setPrefs, onNext, onBack }: StepProps) {
  const toggle = (id: string) => {
    setPrefs((p) => ({
      ...p,
      sections: p.sections.includes(id) ? p.sections.filter((s) => s !== id) : [...p.sections, id],
    }));
  };

  return (
    <div>
      <h2 style={{ color: "#F1F5F9", fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>Cosa vuoi tracciare?</h2>
      <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 20px" }}>Seleziona una o più sezioni. Puoi cambiarle in qualsiasi momento.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
        {SECTIONS.map((s) => {
          const active = prefs.sections.includes(s.id);
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => toggle(s.id)} style={{
              padding: "14px",
              borderRadius: "12px",
              border: active ? `1.5px solid ${s.color}` : "1.5px solid #1E2D42",
              background: active ? `${s.color}14` : "#131b35",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.18s",
              position: "relative",
            }}>
              {active && (
                <div style={{ position: "absolute", top: "8px", right: "8px", width: "16px", height: "16px", borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={10} color="white" />
                </div>
              )}
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                <Icon size={16} color={s.color} />
              </div>
              <p style={{ color: active ? "#F1F5F9" : "#64748B", fontSize: "13px", fontWeight: 600, margin: "0 0 2px" }}>{s.label}</p>
              <p style={{ color: "#475569", fontSize: "11px", margin: 0 }}>{s.desc}</p>
            </button>
          );
        })}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={prefs.sections.length === 0} nextLabel="Continua" />
    </div>
  );
}

function StepTax({ prefs, setPrefs, onNext, onBack }: StepProps) {
  return (
    <div>
      <h2 style={{ color: "#F1F5F9", fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>Fiscalità</h2>
      <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 20px" }}>Questi dati ci aiutano a calcolare il netto dai tuoi profitti.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
        {/* Country */}
        <div>
          <label style={labelStyle}>Paese di residenza fiscale</label>
          <div style={{ position: "relative" }}>
            <Globe size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
            <select value={prefs.taxRegion} onChange={(e) => setPrefs((p) => ({ ...p, taxRegion: e.target.value }))}
              className="input-dark pl-icon" style={{ appearance: "none", cursor: "pointer" }}>
              <option value="IT">🇮🇹 Italia</option>
              <option value="US">🇺🇸 Stati Uniti</option>
              <option value="UK">🇬🇧 Regno Unito</option>
              <option value="DE">🇩🇪 Germania</option>
              <option value="FR">🇫🇷 Francia</option>
              <option value="OTHER">🌍 Altro</option>
            </select>
          </div>
        </div>

        {/* Tax rate */}
        <div>
          <label style={labelStyle}>Aliquota fiscale sulle plusvalenze</label>
          <div style={{ position: "relative" }}>
            <Percent size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
            <input type="number" min={0} max={100} value={prefs.taxRate}
              onChange={(e) => setPrefs((p) => ({ ...p, taxRate: Number(e.target.value) }))}
              className="input-dark pl-icon" placeholder="26" />
          </div>
          <p style={{ color: "#475569", fontSize: "11px", margin: "6px 0 0" }}>
            In Italia: 26% regime dichiarativo, 12.5% titoli di stato
          </p>
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Continua" />
    </div>
  );
}

function StepBudget({ prefs, setPrefs, onNext, onBack, onSubmit, submitting }: StepProps & { onSubmit: () => void; submitting: boolean }) {
  const isCustom = prefs.budgetRule === "custom";
  const { needs, wants, savings } = prefs.budgetCustom;
  const total = needs + wants + savings;

  return (
    <div>
      <h2 style={{ color: "#F1F5F9", fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>Regola di budgeting</h2>
      <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 20px" }}>Come vuoi allocare le tue entrate mensili?</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {BUDGET_RULES.map((r) => {
          const active = prefs.budgetRule === r.id;
          return (
            <button key={r.id} onClick={() => {
              setPrefs((p) => ({
                ...p,
                budgetRule: r.id,
                budgetCustom: r.values ?? p.budgetCustom,
              }));
            }} style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: active ? "1.5px solid #7C3AED" : "1.5px solid #1E2D42",
              background: active ? "rgba(124,58,237,0.1)" : "#131b35",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.18s",
            }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: active ? "#F1F5F9" : "#64748B", fontSize: "14px", fontWeight: 700, margin: "0 0 2px" }}>{r.label}</p>
                <p style={{ color: "#475569", fontSize: "12px", margin: 0 }}>{r.desc}</p>
              </div>
              {active && <CheckCircle size={18} color="#7C3AED" />}
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div style={{ background: "#131b35", borderRadius: "12px", padding: "16px", marginBottom: "20px", border: "1px solid #1E2D42" }}>
          {[
            { key: "needs" as const, label: "Necessità", color: "#3B82F6" },
            { key: "wants" as const, label: "Desideri", color: "#F59E0B" },
            { key: "savings" as const, label: "Risparmio", color: "#10B981" },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ color: "#64748B", fontSize: "12px", fontWeight: 600 }}>{label}</label>
                <span style={{ color, fontSize: "12px", fontWeight: 700 }}>{prefs.budgetCustom[key]}%</span>
              </div>
              <input type="range" min={0} max={100} value={prefs.budgetCustom[key]}
                onChange={(e) => setPrefs((p) => ({ ...p, budgetCustom: { ...p.budgetCustom, [key]: Number(e.target.value) } }))}
                style={{ width: "100%", accentColor: color }} />
            </div>
          ))}
          {total !== 100 && (
            <p style={{ color: "#FCA5A5", fontSize: "11px", margin: "4px 0 0", textAlign: "center" }}>
              Totale: {total}% — deve essere 100%
            </p>
          )}
        </div>
      )}

      <NavRow
        onBack={onBack}
        onNext={onSubmit}
        nextLabel={submitting ? "Salvataggio..." : "Vai alla Dashboard →"}
        nextDisabled={submitting || (isCustom && total !== 100)}
        nextColor="#10B981"
        nextTextColor="#000"
      />
    </div>
  );
}

/* ── Helper components ──────────────────────────────────────────────── */
interface StepProps {
  prefs: Prefs;
  setPrefs: React.Dispatch<React.SetStateAction<Prefs>>;
  onNext: () => void;
  onBack: () => void;
}

function NavRow({ onBack, onNext, nextLabel = "Continua", nextDisabled = false, nextColor = "#7C3AED", nextTextColor = "#fff" }: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextColor?: string;
  nextTextColor?: string;
}) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={onBack} style={{
        padding: "11px 18px",
        borderRadius: "10px",
        border: "1px solid #1E2D42",
        background: "transparent",
        color: "#64748B",
        fontSize: "13px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
      }}>
        <ArrowLeft size={14} />
      </button>
      <button onClick={onNext} disabled={nextDisabled} style={{
        flex: 1,
        padding: "11px",
        borderRadius: "10px",
        border: "none",
        background: nextColor,
        color: nextTextColor,
        fontSize: "13px",
        fontWeight: 600,
        cursor: nextDisabled ? "not-allowed" : "pointer",
        opacity: nextDisabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        transition: "opacity 0.2s",
      }}>
        {nextLabel} {!nextLabel.includes("→") && <ArrowRight size={14} />}
      </button>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 28px",
    borderRadius: "12px",
    border: "none",
    background: bg,
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: `0 4px 20px ${bg}66`,
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#64748B",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

/* ── Progress bar ───────────────────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ color: "#64748B", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Configurazione
        </span>
        <span style={{ color: "#7C3AED", fontSize: "11px", fontWeight: 700 }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: "4px", background: "#1E2D42", borderRadius: "2px", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ height: "100%", background: "linear-gradient(90deg, #6D28D9, #7C3AED)", borderRadius: "2px" }}
        />
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "10px", justifyContent: "center" }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{
            width: i < step ? "20px" : "6px",
            height: "6px",
            borderRadius: "3px",
            background: i < step ? "#7C3AED" : "#1E2D42",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    sections: [],
    taxRegion: "IT",
    taxRate: 26,
    budgetRule: "503020",
    budgetCustom: { needs: 50, wants: 30, savings: 20 },
  });

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function handleSubmit() {
    setSubmitting(true);
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    router.push("/dashboard");
    router.refresh();
  }

  const stepContent = [
    <StepWelcome key="welcome" onNext={next} />,
    <StepSections key="sections" prefs={prefs} setPrefs={setPrefs} onNext={next} onBack={back} />,
    <StepTax key="tax" prefs={prefs} setPrefs={setPrefs} onNext={next} onBack={back} />,
    <StepBudget key="budget" prefs={prefs} setPrefs={setPrefs} onNext={next} onBack={back} onSubmit={handleSubmit} submitting={submitting} />,
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "#07090F",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, #7C3AED, transparent)", filter: "blur(100px)", opacity: 0.05 }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, #3B82F6, transparent)", filter: "blur(100px)", opacity: 0.05 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#0F172A",
          border: "1px solid #1E2D42",
          borderRadius: "20px",
          padding: "36px 40px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6D28D9, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ color: "#F1F5F9", fontWeight: 700, fontSize: "15px" }}>AIO Tracker</span>
        </div>

        {step > 0 && <ProgressBar step={step} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
