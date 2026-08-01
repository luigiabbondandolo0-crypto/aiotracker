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
    background: "#212946",
    border: "1px solid #29314f",
    color: "#bdc8f0",
    borderRadius: "8px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: 500, color: "#8492c4", marginBottom: "6px" };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Aggiungi Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Equity Totale", value: formatCurrency(totalEquity, "USD"), icon: <TrendingUp size={16} />, color: "#90caf9" },
          { label: "Balance Totale", value: formatCurrency(totalBalance, "USD"), icon: <DollarSign size={16} />, color: "#b39ddb" },
          { label: "Account Attivi", value: String(activeCount), icon: <Activity size={16} />, color: "#69f0ae" },
          { label: "Payout Totali", value: formatCurrency(totalPayouts, "USD"), icon: <Trophy size={16} />, color: "#ffe57f" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: "#d7dcec" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Account List */}
      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#8492c4" }}>Caricamento...</div>
      ) : accounts.length === 0 ? (
        <div className="card p-10 text-center">
          <Trophy size={40} style={{ color: "#8492c4", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#d7dcec" }}>Nessun account prop firm</p>
          <p className="text-sm mt-1" style={{ color: "#8492c4" }}>Aggiungi il tuo primo account</p>
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

            return (
              <div key={acc.id} className="card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={typeBadge(acc.accountType)}>{TYPE_LABELS[acc.accountType]}</span>
                      <span className={statusBadge(acc.status)}>{STATUS_LABELS[acc.status]}</span>
                    </div>
                    <h3 className="font-semibold text-base" style={{ color: "#d7dcec" }}>{acc.firmName}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>
                      {formatCurrency(acc.accountSize, acc.currency)} — dal {formatDate(acc.startDate)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(acc)} className="btn-ghost p-1.5" title="Modifica">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleting(acc)} className="btn-ghost p-1.5" title="Elimina"
                      style={{ color: "#ef9a9a" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Balance / Equity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: "#212946" }}>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Balance</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#bdc8f0" }}>{formatCurrency(acc.balance, acc.currency)}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#212946" }}>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Equity</p>
                    <p className="font-semibold mt-0.5" style={{ color: pnl >= 0 ? "#00e676" : "#f44336" }}>
                      {formatCurrency(acc.equity, acc.currency)}
                      <span className="text-xs ml-1" style={{ opacity: 0.8 }}>({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>

                {/* Progress bars */}
                {profitPct !== null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "#8492c4" }}>Profit Target</span>
                      <span className="text-xs" style={{ color: "#90caf9" }}>{profitPct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${Math.max(profitPct, 0)}%`,
                        background: "linear-gradient(90deg, #1565c0, #2196f3)",
                        boxShadow: "0 0 8px rgba(33,150,243,0.5)",
                      }} />
                    </div>
                  </div>
                )}
                {drawdownPct !== null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "#8492c4" }}>Drawdown Corrente</span>
                      <span className="text-xs" style={{ color: drawdownPct > 70 ? "#f44336" : "#ffe57f" }}>
                        {acc.currentDrawdown?.toFixed(1)}% / {acc.maxDrawdown}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${Math.min(drawdownPct, 100)}%`,
                        background: drawdownPct > 70
                          ? "linear-gradient(90deg, #c62828, #f44336)"
                          : "linear-gradient(90deg, #f9a825, #ffc107)",
                        boxShadow: drawdownPct > 70 ? "0 0 8px rgba(244,67,54,0.5)" : "0 0 8px rgba(255,193,7,0.5)",
                      }} />
                    </div>
                  </div>
                )}

                {/* Payouts */}
                <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid #29314f" }}>
                  <div>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Payout Totale</p>
                    <p className="font-semibold text-sm" style={{ color: "#69f0ae" }}>{formatCurrency(acc.totalPayout, acc.currency)}</p>
                  </div>
                  {(acc.status === "PASSED" || acc.status === "ACTIVE" || acc.status === "PAYOUT_REQUESTED") && (
                    <button
                      onClick={() => { setPayoutTarget(acc); setPayoutForm(emptyPayoutForm); }}
                      className="btn-ghost text-xs flex items-center gap-1.5"
                      style={{ color: "#90caf9" }}
                    >
                      <Plus size={12} />
                      Aggiungi Payout
                    </button>
                  )}
                </div>

                {/* Recent payouts */}
                {acc.payouts.length > 0 && (
                  <div className="space-y-1.5">
                    {acc.payouts.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "#212946" }}>
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} style={{ color: "#8492c4" }} />
                          <span className="text-xs" style={{ color: "#bdc8f0" }}>{formatDate(p.date)}</span>
                          <span className={payoutBadge(p.status)}>{PAYOUT_STATUS_LABELS[p.status]}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "#69f0ae" }}>
                          {formatCurrency(p.amount, acc.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.firmName || !form.balance || !form.equity}>
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setPayoutTarget(null)}>Annulla</button>
              <button className="btn-primary" onClick={handlePayout} disabled={saving || !payoutForm.amount}>
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
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#f44336", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#bdc8f0" }}>
                Stai per eliminare <strong style={{ color: "#d7dcec" }}>{deleting.firmName}</strong>. Questa azione è irreversibile.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeleting(null)}>Annulla</button>
              <button onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
                style={{ background: "rgba(244,67,54,0.15)", color: "#f44336", border: "1px solid rgba(244,67,54,0.3)" }}>
                Elimina
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
