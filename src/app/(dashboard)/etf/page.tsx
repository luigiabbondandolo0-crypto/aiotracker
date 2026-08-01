"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart2, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

type PACFreq = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";

interface ETFContribution {
  id: string;
  date: string;
  amount: number;
  units: number;
  price: number;
  fees: number;
  notes?: string;
}

interface ETFPlan {
  id: string;
  name: string;
  ticker: string;
  isin?: string;
  broker?: string;
  frequency: PACFreq;
  amount: number;
  startDate: string;
  currency: string;
  totalInvested: number;
  currentValue: number;
  avgPrice?: number;
  units: number;
  isActive: boolean;
  notes?: string;
  contributions: ETFContribution[];
}

const FREQ_LABELS: Record<PACFreq, string> = {
  WEEKLY: "Settimanale", BIWEEKLY: "Bisettimanale", MONTHLY: "Mensile", QUARTERLY: "Trimestrale",
};
const FREQ_BADGE: Record<PACFreq, string> = {
  WEEKLY: "badge badge-yellow", BIWEEKLY: "badge badge-purple",
  MONTHLY: "badge badge-blue", QUARTERLY: "badge badge-green",
};

const emptyPlanForm = {
  name: "", ticker: "", isin: "", broker: "", frequency: "MONTHLY" as PACFreq,
  amount: "", startDate: new Date().toISOString().slice(0, 10),
  currency: "EUR", currentValue: "", isActive: true, notes: "",
};

const emptyContribForm = {
  planId: "", date: new Date().toISOString().slice(0, 10),
  amount: "", units: "", price: "", fees: "", notes: "",
};

const inputStyle = {
  background: "#162032", border: "1px solid #1E2D42", color: "#CBD5E1",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "6px",
};

export default function ETFPage() {
  const [plans, setPlans] = useState<ETFPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ETFPlan | null>(null);
  const [deleting, setDeleting] = useState<ETFPlan | null>(null);
  const [contribTarget, setContribTarget] = useState<ETFPlan | null>(null);
  const [form, setForm] = useState(emptyPlanForm);
  const [contribForm, setContribForm] = useState(emptyContribForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/etf-plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalInvested = plans.reduce((s, p) => s + p.totalInvested, 0);
  const totalValue = plans.reduce((s, p) => s + (p.currentValue || p.totalInvested), 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const f = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));
  const fc = (k: string, v: string) => setContribForm((p) => ({ ...p, [k]: v }));

  const openEdit = (plan: ETFPlan) => {
    setForm({
      name: plan.name, ticker: plan.ticker, isin: plan.isin ?? "",
      broker: plan.broker ?? "", frequency: plan.frequency,
      amount: String(plan.amount), startDate: plan.startDate.slice(0, 10),
      currency: plan.currency, currentValue: String(plan.currentValue || ""),
      isActive: plan.isActive, notes: plan.notes ?? "",
    });
    setEditing(plan);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/etf-plans/${editing.id}` : "/api/etf-plans";
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await fetchData(); setSaving(false); setShowAdd(false); setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/etf-plans/${deleting.id}`, { method: "DELETE" });
    await fetchData(); setDeleting(null);
  };

  const handleContrib = async () => {
    if (!contribTarget) return;
    setSaving(true);
    await fetch(`/api/etf-plans/${contribTarget.id}/contributions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contribForm),
    });
    await fetchData(); setSaving(false); setContribTarget(null); setContribForm(emptyContribForm);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="page-hero animate-fade-in">
        <div className="page-hero-text">
          <h1 className="page-hero-title">ETF & PAC</h1>
          <p className="page-hero-sub">Piani di accumulo e investimento passivo</p>
        </div>
        <div className="page-hero-actions">
          <button onClick={() => { setForm(emptyPlanForm); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Nuovo PAC
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Totale Investito", value: formatCurrency(totalInvested), icon: <DollarSign size={16} />, color: "#93C5FD" },
          { label: "Valore Attuale", value: formatCurrency(totalValue), icon: <BarChart2 size={16} />, color: "#C4B5FD" },
          { label: "Guadagno", value: formatCurrency(totalGain), icon: totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalGain >= 0 ? "#10B981" : "#EF4444" },
          { label: "Piani Attivi", value: String(plans.filter((p) => p.isActive).length), icon: <BarChart2 size={16} />, color: "#6EE7B7" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            {s.label === "Guadagno" && (
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%</p>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#64748B" }}>Caricamento...</div>
      ) : plans.length === 0 ? (
        <div className="card p-10 text-center">
          <BarChart2 size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessun piano PAC</p>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Crea il tuo primo piano di accumulo su ETF</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">Nuovo PAC</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const value = plan.currentValue || plan.totalInvested;
            const gain = value - plan.totalInvested;
            const gainPct = plan.totalInvested > 0 ? (gain / plan.totalInvested) * 100 : 0;
            const progressPct = plan.totalInvested > 0 ? Math.min((value / plan.totalInvested) * 100, 200) : 0;

            return (
              <div key={plan.id} className="card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={FREQ_BADGE[plan.frequency]}>{FREQ_LABELS[plan.frequency]}</span>
                      {!plan.isActive && <span className="badge">Inattivo</span>}
                    </div>
                    <h3 className="font-semibold text-base" style={{ color: "#F1F5F9" }}>{plan.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                      {plan.ticker}{plan.broker ? ` — ${plan.broker}` : ""} — dal {formatDate(plan.startDate)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleting(plan)} className="btn-ghost p-1.5" style={{ color: "#FCA5A5" }}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: "#162032" }}>
                    <p className="text-xs" style={{ color: "#64748B" }}>Investito</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#CBD5E1" }}>{formatCurrency(plan.totalInvested, plan.currency)}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#162032" }}>
                    <p className="text-xs" style={{ color: "#64748B" }}>Valore Attuale</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#CBD5E1" }}>{formatCurrency(value, plan.currency)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: "#64748B" }}>Performance</span>
                    <span className="text-xs font-semibold" style={{ color: gain >= 0 ? "#10B981" : "#EF4444" }}>
                      {gain >= 0 ? "+" : ""}{formatCurrency(gain, plan.currency)} ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${Math.min(Math.max(progressPct - 100, 0) + (progressPct < 100 ? progressPct : 0), 100)}%`,
                      background: gain >= 0 ? "linear-gradient(90deg, #059669, #10B981)" : "linear-gradient(90deg, #B91C1C, #EF4444)",
                      boxShadow: gain >= 0 ? "0 0 8px rgba(16,185,129,0.5)" : "0 0 8px rgba(239,68,68,0.5)",
                    }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid #1E2D42" }}>
                  <div className="flex gap-3">
                    <div>
                      <span className="text-xs" style={{ color: "#64748B" }}>Quota mensile: </span>
                      <span className="text-xs font-semibold" style={{ color: "#CBD5E1" }}>{formatCurrency(plan.amount, plan.currency)}</span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: "#64748B" }}>{plan.contributions.length} contributi</span>
                    </div>
                  </div>
                  <button onClick={() => { setContribTarget(plan); setContribForm(emptyContribForm); }}
                    className="btn-ghost text-xs flex items-center gap-1.5" style={{ color: "#93C5FD" }}>
                    <Plus size={12} /> Contributo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {(showAdd || editing) && (
        <Modal title={editing ? "Modifica Piano PAC" : "Nuovo Piano PAC"} onClose={() => { setShowAdd(false); setEditing(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label style={labelStyle}>Nome Piano *</label><input style={inputStyle} placeholder="es. iShares World" value={form.name} onChange={(e) => f("name", e.target.value)} /></div>
              <div><label style={labelStyle}>Ticker *</label><input style={inputStyle} placeholder="es. SWDA" value={form.ticker} onChange={(e) => f("ticker", e.target.value)} /></div>
              <div><label style={labelStyle}>ISIN (opz.)</label><input style={inputStyle} placeholder="es. IE00B4L5Y983" value={form.isin} onChange={(e) => f("isin", e.target.value)} /></div>
              <div><label style={labelStyle}>Broker (opz.)</label><input style={inputStyle} placeholder="es. Fineco, Directa" value={form.broker} onChange={(e) => f("broker", e.target.value)} /></div>
              <div><label style={labelStyle}>Frequenza</label>
                <select style={inputStyle} value={form.frequency} onChange={(e) => f("frequency", e.target.value)}>
                  {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Valuta</label>
                <select style={inputStyle} value={form.currency} onChange={(e) => f("currency", e.target.value)}>
                  <option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option>
                </select>
              </div>
              <div><label style={labelStyle}>Quota Periodica *</label><input style={inputStyle} type="number" placeholder="0.00" value={form.amount} onChange={(e) => f("amount", e.target.value)} /></div>
              {editing && (
                <div><label style={labelStyle}>Valore Attuale</label><input style={inputStyle} type="number" placeholder="0.00" value={form.currentValue} onChange={(e) => f("currentValue", e.target.value)} /></div>
              )}
              <div><label style={labelStyle}>Data Inizio</label><input style={inputStyle} type="date" value={form.startDate} onChange={(e) => f("startDate", e.target.value)} /></div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={form.notes} onChange={(e) => f("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.ticker || !form.amount}>
                {saving ? "Salvo..." : editing ? "Aggiorna" : "Crea PAC"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Contribution Modal */}
      {contribTarget && (
        <Modal title={`Contributo — ${contribTarget.name}`} onClose={() => setContribTarget(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label style={labelStyle}>Data</label><input style={inputStyle} type="date" value={contribForm.date} onChange={(e) => fc("date", e.target.value)} /></div>
              <div><label style={labelStyle}>Importo ({contribTarget.currency})</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={contribForm.amount} onChange={(e) => fc("amount", e.target.value)} /></div>
              <div><label style={labelStyle}>Quote Acquistate</label><input style={inputStyle} type="number" step="any" placeholder="0.000" value={contribForm.units} onChange={(e) => fc("units", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo per Quota</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={contribForm.price} onChange={(e) => fc("price", e.target.value)} /></div>
              <div><label style={labelStyle}>Commissioni</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={contribForm.fees} onChange={(e) => fc("fees", e.target.value)} /></div>
              <div><label style={labelStyle}>Note</label><input style={inputStyle} value={contribForm.notes} onChange={(e) => fc("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setContribTarget(null)}>Annulla</button>
              <button className="btn-primary" onClick={handleContrib}
                disabled={saving || !contribForm.amount || !contribForm.units || !contribForm.price}>
                {saving ? "Salvo..." : "Aggiungi Contributo"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal title="Elimina Piano" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#CBD5E1" }}>
                Elimina piano <strong style={{ color: "#F1F5F9" }}>{deleting.name} ({deleting.ticker})</strong> e tutti i contributi. Azione irreversibile.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeleting(null)}>Annulla</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                Elimina
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
