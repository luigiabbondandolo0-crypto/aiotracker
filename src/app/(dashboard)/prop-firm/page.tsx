"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Trophy, Plus, Edit2, Trash2, DollarSign, Activity,
  TrendingUp, ChevronRight, AlertCircle,
} from "lucide-react";

type PropAccountType = "CHALLENGE" | "VERIFICATION" | "FUNDED";
type PropAccountStatus = "ACTIVE" | "PASSED" | "FAILED" | "PAYOUT_REQUESTED" | "CLOSED";
type PayoutStatus = "PENDING" | "RECEIVED" | "REJECTED";

interface PropPayout {
  id: string;
  amount: number;
  date: string;
  status: PayoutStatus;
  notes?: string;
}

interface PropFirmAccount {
  id: string;
  firmName: string;
  accountSize: number;
  accountType: PropAccountType;
  status: PropAccountStatus;
  startDate: string;
  endDate?: string;
  currency: string;
  balance: number;
  equity: number;
  profitTarget?: number;
  maxDrawdown?: number;
  currentDrawdown?: number;
  totalPayout: number;
  notes?: string;
  payouts: PropPayout[];
}

const STATUS_LABELS: Record<PropAccountStatus, string> = {
  ACTIVE: "Attivo",
  PASSED: "Passato",
  FAILED: "Fallito",
  PAYOUT_REQUESTED: "Payout Richiesto",
  CLOSED: "Chiuso",
};

const TYPE_LABELS: Record<PropAccountType, string> = {
  CHALLENGE: "Challenge",
  VERIFICATION: "Verifica",
  FUNDED: "Funded",
};

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: "In Attesa",
  RECEIVED: "Ricevuto",
  REJECTED: "Rifiutato",
};

function statusBadge(status: PropAccountStatus) {
  const styles: Record<PropAccountStatus, string> = {
    ACTIVE: "badge badge-blue",
    PASSED: "badge badge-green",
    FAILED: "badge badge-red",
    PAYOUT_REQUESTED: "badge badge-yellow",
    CLOSED: "badge",
  };
  return styles[status] ?? "badge";
}

function typeBadge(type: PropAccountType) {
  const styles: Record<PropAccountType, string> = {
    CHALLENGE: "badge badge-purple",
    VERIFICATION: "badge badge-yellow",
    FUNDED: "badge badge-green",
  };
  return styles[type] ?? "badge";
}

function payoutBadge(status: PayoutStatus) {
  const styles: Record<PayoutStatus, string> = {
    PENDING: "badge badge-yellow",
    RECEIVED: "badge badge-green",
    REJECTED: "badge badge-red",
  };
  return styles[status] ?? "badge";
}

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 200000];

const emptyForm = {
  firmName: "",
  accountSize: "10000",
  accountType: "CHALLENGE" as PropAccountType,
  status: "ACTIVE" as PropAccountStatus,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  currency: "USD",
  balance: "",
  equity: "",
  profitTarget: "",
  maxDrawdown: "",
  currentDrawdown: "",
  notes: "",
};

const emptyPayoutForm = {
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  status: "PENDING" as PayoutStatus,
  notes: "",
};

export default function PropFirmPage() {
  const [accounts, setAccounts] = useState<PropFirmAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<PropFirmAccount | null>(null);
  const [deleting, setDeleting] = useState<PropFirmAccount | null>(null);
  const [payoutTarget, setPayoutTarget] = useState<PropFirmAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [payoutForm, setPayoutForm] = useState(emptyPayoutForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/prop-firm");
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openEdit = (acc: PropFirmAccount) => {
    setForm({
      firmName: acc.firmName,
      accountSize: String(acc.accountSize),
      accountType: acc.accountType,
      status: acc.status,
      startDate: acc.startDate.slice(0, 10),
      endDate: acc.endDate ? acc.endDate.slice(0, 10) : "",
      currency: acc.currency,
      balance: String(acc.balance),
      equity: String(acc.equity),
      profitTarget: acc.profitTarget ? String(acc.profitTarget) : "",
      maxDrawdown: acc.maxDrawdown ? String(acc.maxDrawdown) : "",
      currentDrawdown: acc.currentDrawdown ? String(acc.currentDrawdown) : "",
      notes: acc.notes ?? "",
    });
    setEditing(acc);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/prop-firm/${editing.id}` : "/api/prop-firm";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await fetchData();
    setSaving(false);
    setShowAdd(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/prop-firm/${deleting.id}`, { method: "DELETE" });
    await fetchData();
    setDeleting(null);
  };

  const handlePayout = async () => {
    if (!payoutTarget) return;
    setSaving(true);
    await fetch(`/api/prop-firm/${payoutTarget.id}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payoutForm),
    });
    await fetchData();
    setSaving(false);
    setPayoutTarget(null);
    setPayoutForm(emptyPayoutForm);
  };

  const f = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  // Stats
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeCount = accounts.filter((a) => a.status === "ACTIVE").length;
  const totalPayouts = accounts.reduce((s, a) => s + a.totalPayout, 0);

  const inputStyle = {
    background: "#162032",
    border: "1px solid #1E2D42",
    color: "#CBD5E1",
    borderRadius: "8px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "6px" };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Premium Hero ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1a0a3c 0%, #100d2a 40%, #07090F 100%)", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 60px rgba(109,40,217,0.08), 0 24px 48px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)", top: "-100px", right: "-60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", bottom: "-40px", left: "30%", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7C3AED", marginBottom: "6px" }}>Prop Firm</p>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4px" }}>Account Finanziati</h1>
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px" }}>Equity totale account attivi</p>
              <p style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: "#C4B5FD", letterSpacing: "-0.04em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loading ? "—" : formatCurrency(totalEquity, "USD")}</p>
            </div>
            <button onClick={openAdd} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#C4B5FD", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.15)"; }}>
              <Plus size={14} /> Aggiungi Account
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            {[
              { label: `Balance: ${loading ? "—" : formatCurrency(totalBalance, "USD")}`, color: "#93C5FD" },
              { label: `${activeCount} attivi`, color: "#6EE7B7" },
              { label: `Payout: ${loading ? "—" : formatCurrency(totalPayouts, "USD")}`, color: "#FCD34D" },
            ].map(b => (
              <span key={b.label} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: b.color }}>{b.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Equity Totale", value: formatCurrency(totalEquity, "USD"), icon: <TrendingUp size={16} />, color: "#93C5FD" },
          { label: "Balance Totale", value: formatCurrency(totalBalance, "USD"), icon: <DollarSign size={16} />, color: "#C4B5FD" },
          { label: "Account Attivi", value: String(activeCount), icon: <Activity size={16} />, color: "#6EE7B7" },
          { label: "Payout Totali", value: formatCurrency(totalPayouts, "USD"), icon: <Trophy size={16} />, color: "#FCD34D" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", lineHeight: 1 }}>{s.label}</p>
              <span style={{ color: s.color, opacity: 0.75 }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{s.icon}</span>
            </div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Account List */}
      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#64748B" }}>Caricamento...</div>
      ) : accounts.length === 0 ? (
        <div className="card p-10 text-center">
          <Trophy size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessun account prop firm</p>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Aggiungi il tuo primo account</p>
          <button onClick={openAdd} className="btn-primary mt-4">Aggiungi Account</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const pnl = acc.equity - acc.accountSize;
            const pnlPct = (pnl / acc.accountSize) * 100;
            const profitPct = acc.profitTarget
              ? Math.min((pnl / acc.profitTarget) * 100, 100)
              : null;
            const drawdownPct = acc.maxDrawdown && acc.currentDrawdown
              ? Math.min((acc.currentDrawdown / acc.maxDrawdown) * 100, 100)
              : null;

            const accentColor = acc.status === "FAILED" || acc.status === "CLOSED" ? "#EF4444"
              : acc.status === "PASSED" ? "#10B981"
              : "#7C3AED";

            return (
              <div key={acc.id} className="animate-fade-in" style={{ borderRadius: "16px", background: "#0F172A", border: "1px solid #1E2D42", borderLeft: `3px solid ${accentColor}`, overflow: "hidden", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px #2D4460, 0 8px 24px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>

                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E2D42" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span className={typeBadge(acc.accountType)}>{TYPE_LABELS[acc.accountType]}</span>
                        <span className={statusBadge(acc.status)}>{STATUS_LABELS[acc.status]}</span>
                      </div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.firmName}</h3>
                      <p style={{ fontSize: "12px", color: "#64748B" }}>
                        <span style={{ color: "#C4B5FD", fontWeight: 600 }}>{formatCurrency(acc.accountSize, acc.currency)}</span>
                        {` · ${acc.currency} · dal ${formatDate(acc.startDate)}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button onClick={() => openEdit(acc)} className="btn-icon" title="Modifica"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleting(acc)} className="btn-icon danger" title="Elimina"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "5px" }}>Equity</p>
                      <p style={{ fontSize: "22px", fontWeight: 700, color: pnl >= 0 ? "#6EE7B7" : "#FCA5A5", letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{formatCurrency(acc.equity, acc.currency)}</p>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>Balance: {formatCurrency(acc.balance, acc.currency)}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "5px" }}>P&amp;L</p>
                      <p style={{ fontSize: "17px", fontWeight: 700, color: pnl >= 0 ? "#6EE7B7" : "#FCA5A5", lineHeight: 1, whiteSpace: "nowrap" }}>
                        {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, acc.currency)}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: pnl >= 0 ? "#10B981" : "#EF4444", marginTop: "2px" }}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress bars */}
                  {profitPct !== null && (
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>Profit Target</span>
                        <span style={{ fontSize: "11px", color: "#93C5FD", fontWeight: 600 }}>{profitPct.toFixed(1)}% di {formatCurrency(acc.profitTarget!, acc.currency)}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.max(profitPct, 0)}%`, background: "linear-gradient(90deg, #1D4ED8, #3B82F6)", boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
                      </div>
                    </div>
                  )}
                  {drawdownPct !== null && (
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>Drawdown</span>
                        <span style={{ fontSize: "11px", color: drawdownPct > 70 ? "#FCA5A5" : "#FCD34D", fontWeight: 600 }}>{acc.currentDrawdown?.toFixed(1)}% / {acc.maxDrawdown}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.min(drawdownPct, 100)}%`, background: drawdownPct > 70 ? "linear-gradient(90deg, #B91C1C, #EF4444)" : "linear-gradient(90deg, #B45309, #F59E0B)", boxShadow: drawdownPct > 70 ? "0 0 8px rgba(239,68,68,0.5)" : "0 0 8px rgba(255,193,7,0.5)" }} />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #1E2D42", gap: "8px" }}>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "3px" }}>Payout Totale</p>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#6EE7B7", whiteSpace: "nowrap" }}>{formatCurrency(acc.totalPayout, acc.currency)}</p>
                    </div>
                    {(acc.status === "PASSED" || acc.status === "ACTIVE" || acc.status === "PAYOUT_REQUESTED") && (
                      <button onClick={() => { setPayoutTarget(acc); setPayoutForm(emptyPayoutForm); }}
                        className="btn-pill" style={{ color: "#C4B5FD", borderColor: "rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.1)", flexShrink: 0 }}>
                        <Plus size={11} /> Payout
                      </button>
                    )}
                  </div>

                {/* Recent payouts */}
                {acc.payouts.length > 0 && (
                  <div className="space-y-1.5">
                    {acc.payouts.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "#162032" }}>
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} style={{ color: "#64748B" }} />
                          <span className="text-xs" style={{ color: "#CBD5E1" }}>{formatDate(p.date)}</span>
                          <span className={payoutBadge(p.status)}>{PAYOUT_STATUS_LABELS[p.status]}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "#6EE7B7" }}>
                          {formatCurrency(p.amount, acc.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing) && (
        <Modal title={editing ? "Modifica Account" : "Aggiungi Account Prop Firm"} onClose={() => { setShowAdd(false); setEditing(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label style={labelStyle}>Prop Firm *</label>
                <input style={inputStyle} placeholder="es. FTMO, MyFundedFx..." value={form.firmName} onChange={(e) => f("firmName", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Dimensione Account</label>
                <select style={inputStyle} value={form.accountSize} onChange={(e) => f("accountSize", e.target.value)}>
                  {ACCOUNT_SIZES.map((s) => <option key={s} value={s}>${s.toLocaleString()}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Valuta</label>
                <select style={inputStyle} value={form.currency} onChange={(e) => f("currency", e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo Account</label>
                <select style={inputStyle} value={form.accountType} onChange={(e) => f("accountType", e.target.value)}>
                  <option value="CHALLENGE">Challenge</option>
                  <option value="VERIFICATION">Verifica</option>
                  <option value="FUNDED">Funded</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Stato</label>
                <select style={inputStyle} value={form.status} onChange={(e) => f("status", e.target.value)}>
                  <option value="ACTIVE">Attivo</option>
                  <option value="PASSED">Passato</option>
                  <option value="FAILED">Fallito</option>
                  <option value="PAYOUT_REQUESTED">Payout Richiesto</option>
                  <option value="CLOSED">Chiuso</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Balance</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={form.balance} onChange={(e) => f("balance", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Equity</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={form.equity} onChange={(e) => f("equity", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Profit Target (%)</label>
                <input style={inputStyle} type="number" placeholder="es. 10" value={form.profitTarget} onChange={(e) => f("profitTarget", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Max Drawdown (%)</label>
                <input style={inputStyle} type="number" placeholder="es. 10" value={form.maxDrawdown} onChange={(e) => f("maxDrawdown", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Drawdown Corrente (%)</label>
                <input style={inputStyle} type="number" placeholder="es. 3.5" value={form.currentDrawdown} onChange={(e) => f("currentDrawdown", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Data Inizio</label>
                <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => f("startDate", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Data Fine (opz.)</label>
                <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => f("endDate", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Note</label>
                <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} value={form.notes} onChange={(e) => f("notes", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-purple flex-1" onClick={handleSave} disabled={saving || !form.firmName || !form.balance || !form.equity}>
                {saving ? "Salvo..." : editing ? "Aggiorna" : "Aggiungi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payout Modal */}
      {payoutTarget && (
        <Modal title={`Payout — ${payoutTarget.firmName}`} onClose={() => setPayoutTarget(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Importo ({payoutTarget.currency})</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={payoutForm.amount}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Data</label>
                <input style={inputStyle} type="date" value={payoutForm.date}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Stato</label>
                <select style={inputStyle} value={payoutForm.status}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, status: e.target.value as PayoutStatus }))}>
                  <option value="PENDING">In Attesa</option>
                  <option value="RECEIVED">Ricevuto</option>
                  <option value="REJECTED">Rifiutato</option>
                </select>
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Note</label>
                <input style={inputStyle} value={payoutForm.notes}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setPayoutTarget(null)}>Annulla</button>
              <button className="btn-purple flex-1" onClick={handlePayout} disabled={saving || !payoutForm.amount}>
                {saving ? "Salvo..." : "Aggiungi Payout"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal title="Elimina Account" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#CBD5E1" }}>
                Stai per eliminare <strong style={{ color: "#F1F5F9" }}>{deleting.firmName}</strong>. Questa azione è irreversibile.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setDeleting(null)}>Annulla</button>
              <button onClick={handleDelete} className="btn-red flex-1">Elimina</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
