"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TabBar } from "@/components/ui/TabBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Plus, Edit2, Trash2, Activity, DollarSign, AlertCircle,
} from "lucide-react";

type AssetClass = "FOREX" | "STOCKS" | "CRYPTO" | "FUTURES" | "OPTIONS" | "MIXED";
type TradeDir = "LONG" | "SHORT";

interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  direction: TradeDir;
  openDate: string;
  closeDate?: string;
  openPrice: number;
  closePrice?: number;
  size: number;
  pnl?: number;
  pnlPct?: number;
  fees: number;
  notes?: string;
}

interface TradingAccount {
  id: string;
  brokerName: string;
  accountName: string;
  currency: string;
  balance: number;
  initialDeposit: number;
  assetClass: AssetClass;
  isActive: boolean;
  notes?: string;
  trades: Trade[];
}

const ASSET_LABELS: Record<AssetClass, string> = {
  FOREX: "Forex", STOCKS: "Azioni", CRYPTO: "Crypto",
  FUTURES: "Futures", OPTIONS: "Opzioni", MIXED: "Misto",
};

const ASSET_BADGE: Record<AssetClass, string> = {
  FOREX: "badge badge-blue", STOCKS: "badge badge-green", CRYPTO: "badge badge-yellow",
  FUTURES: "badge badge-purple", OPTIONS: "badge badge-red", MIXED: "badge",
};

const emptyAccForm = {
  brokerName: "", accountName: "", currency: "USD", balance: "",
  initialDeposit: "", assetClass: "FOREX" as AssetClass, notes: "",
};

const emptyTradeForm = {
  accountId: "", symbol: "", direction: "LONG" as TradeDir,
  openDate: new Date().toISOString().slice(0, 10), closeDate: "",
  openPrice: "", closePrice: "", size: "", pnl: "", pnlPct: "", fees: "", notes: "",
};

const inputStyle = {
  background: "#162032", border: "1px solid #1E2D42", color: "#CBD5E1",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "6px",
};

export default function TradingPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"conti" | "trades">("conti");
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [editingAcc, setEditingAcc] = useState<TradingAccount | null>(null);
  const [deletingAcc, setDeletingAcc] = useState<TradingAccount | null>(null);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [accForm, setAccForm] = useState(emptyAccForm);
  const [tradeForm, setTradeForm] = useState(emptyTradeForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/trading-accounts");
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const allTrades = accounts.flatMap((a) =>
    a.trades.map((t) => ({ ...t, _accName: `${a.brokerName} — ${a.accountName}`, _cur: a.currency }))
  ).sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalDeposit = accounts.reduce((s, a) => s + a.initialDeposit, 0);
  const totalPnL = totalBalance - totalDeposit;
  const totalPnLPct = totalDeposit > 0 ? (totalPnL / totalDeposit) * 100 : 0;

  const fa = (k: string, v: string) => setAccForm((p) => ({ ...p, [k]: v }));
  const ft = (k: string, v: string) => setTradeForm((p) => ({ ...p, [k]: v }));

  const openEditAcc = (acc: TradingAccount) => {
    setAccForm({
      brokerName: acc.brokerName, accountName: acc.accountName, currency: acc.currency,
      balance: String(acc.balance), initialDeposit: String(acc.initialDeposit),
      assetClass: acc.assetClass, notes: acc.notes ?? "",
    });
    setEditingAcc(acc);
  };

  const handleSaveAcc = async () => {
    setSaving(true);
    const url = editingAcc ? `/api/trading-accounts/${editingAcc.id}` : "/api/trading-accounts";
    await fetch(url, { method: editingAcc ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(accForm) });
    await fetchData(); setSaving(false); setShowAddAcc(false); setEditingAcc(null);
  };

  const handleDeleteAcc = async () => {
    if (!deletingAcc) return;
    await fetch(`/api/trading-accounts/${deletingAcc.id}`, { method: "DELETE" });
    await fetchData(); setDeletingAcc(null);
  };

  const handleSaveTrade = async () => {
    setSaving(true);
    await fetch(`/api/trading-accounts/${tradeForm.accountId}/trades`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tradeForm),
    });
    await fetchData(); setSaving(false); setShowAddTrade(false); setTradeForm(emptyTradeForm);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Premium Hero ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #071829 0%, #0d1a2e 40%, #07090F 100%)", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 0 60px rgba(30,80,180,0.08), 0 24px 48px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)", top: "-100px", right: "-60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", bottom: "-40px", left: "30%", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3B82F6", marginBottom: "6px" }}>Trading</p>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4px" }}>Account Trading</h1>
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px" }}>Balance totale</p>
              <p style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: "#93C5FD", letterSpacing: "-0.04em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loading ? "—" : formatCurrency(totalBalance, "USD")}</p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
              {accounts.length > 0 && (
                <button onClick={() => { setTradeForm(emptyTradeForm); setShowAddTrade(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#CBD5E1", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}>
                  <Plus size={14} /> Trade
                </button>
              )}
              <button onClick={() => { setAccForm(emptyAccForm); setShowAddAcc(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93C5FD", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.15)"; }}>
                <Plus size={14} /> Conto
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: totalPnL >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${totalPnL >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, fontSize: "11px", fontWeight: 600, color: totalPnL >= 0 ? "#6EE7B7" : "#FCA5A5" }}>
              {totalPnL >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              P&L: {loading ? "—" : formatCurrency(totalPnL, "USD")} ({totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(1)}%)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: "#64748B" }}>
              {accounts.filter(a => a.isActive).length} conti · {allTrades.length} trade
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Balance Totale", value: formatCurrency(totalBalance, "USD"), icon: <DollarSign size={16} />, color: "#93C5FD" },
          { label: "P&L Totale", value: formatCurrency(totalPnL, "USD"), icon: totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalPnL >= 0 ? "#10B981" : "#EF4444" },
          { label: "Conti Attivi", value: String(accounts.filter((a) => a.isActive).length), icon: <Activity size={16} />, color: "#6EE7B7" },
          { label: "Trade Registrati", value: String(allTrades.length), icon: <Activity size={16} />, color: "#C4B5FD" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", lineHeight: 1 }}>{s.label}</p>
              <span style={{ color: s.color, opacity: 0.75 }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{s.icon}</span>
            </div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{s.value}</p>
            {s.label === "P&L Totale" && (
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%</p>
            )}
          </div>
        ))}
      </div>

      <TabBar tabs={[{ key: "conti", label: "Conti" }, { key: "trades", label: `Trade Log (${allTrades.length})` }]} active={tab} onChange={setTab} />

      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#64748B" }}>Caricamento...</div>
      ) : tab === "conti" ? (
        accounts.length === 0 ? (
          <div className="card p-10 text-center">
            <TrendingUp size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
            <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessun conto trading</p>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>Aggiungi il tuo primo conto broker</p>
            <button onClick={() => setShowAddAcc(true)} className="btn-primary mt-4">Aggiungi Conto</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const pnl = acc.balance - acc.initialDeposit;
              const pnlPct = acc.initialDeposit > 0 ? (pnl / acc.initialDeposit) * 100 : 0;
              return (
                <div key={acc.id} className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={ASSET_BADGE[acc.assetClass]}>{ASSET_LABELS[acc.assetClass]}</span>
                        {!acc.isActive && <span className="badge">Inattivo</span>}
                      </div>
                      <h3 className="font-semibold text-base" style={{ color: "#F1F5F9" }}>{acc.brokerName}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{acc.accountName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditAcc(acc)} className="btn-icon"><Edit2 size={13} /></button>
                      <button onClick={() => setDeletingAcc(acc)} className="btn-icon danger"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Deposito", value: formatCurrency(acc.initialDeposit, acc.currency), color: "#CBD5E1" },
                      { label: "Balance", value: formatCurrency(acc.balance, acc.currency), color: "#CBD5E1" },
                      { label: "P&L", value: `${formatCurrency(pnl, acc.currency)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`, color: pnl >= 0 ? "#10B981" : "#EF4444" },
                    ].map((c) => (
                      <div key={c.label} className="rounded-lg p-3" style={{ background: "#162032" }}>
                        <p className="text-xs" style={{ color: "#64748B" }}>{c.label}</p>
                        <p className="font-semibold text-sm mt-0.5" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center mt-3 pt-3" style={{ borderTop: "1px solid #1E2D42" }}>
                    <span className="text-xs" style={{ color: "#64748B" }}>{acc.trades.length} trade registrati</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        allTrades.length === 0 ? (
          <div className="card p-10 text-center">
            <Activity size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
            <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessun trade registrato</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D42" }}>
                    {["Data", "Conto", "Simbolo", "Dir.", "Open", "Close", "Size", "P&L", "Fees"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#64748B", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTrades.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #1E2D42", transition: "background 150ms" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#162032")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 14px", color: "#64748B", whiteSpace: "nowrap" }}>{formatDate(t.openDate)}</td>
                      <td style={{ padding: "10px 14px", color: "#CBD5E1", whiteSpace: "nowrap" }}>{(t as any)._accName}</td>
                      <td style={{ padding: "10px 14px", color: "#F1F5F9", fontWeight: 600 }}>{t.symbol}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className={t.direction === "LONG" ? "badge badge-green" : "badge badge-red"}>{t.direction}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#CBD5E1" }}>{t.openPrice}</td>
                      <td style={{ padding: "10px 14px", color: "#CBD5E1" }}>{t.closePrice ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#CBD5E1" }}>{t.size}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {t.pnl != null ? (
                          <span style={{ color: t.pnl >= 0 ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                            {t.pnl >= 0 ? "+" : ""}{formatCurrency(t.pnl, (t as any)._cur)}
                          </span>
                        ) : <span style={{ color: "#64748B" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748B" }}>{t.fees > 0 ? formatCurrency(t.fees, (t as any)._cur) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Add/Edit Account Modal */}
      {(showAddAcc || editingAcc) && (
        <Modal title={editingAcc ? "Modifica Conto" : "Aggiungi Conto Trading"} onClose={() => { setShowAddAcc(false); setEditingAcc(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label style={labelStyle}>Broker *</label><input style={inputStyle} placeholder="es. Interactive Brokers" value={accForm.brokerName} onChange={(e) => fa("brokerName", e.target.value)} /></div>
              <div><label style={labelStyle}>Nome Account *</label><input style={inputStyle} placeholder="es. Main Account" value={accForm.accountName} onChange={(e) => fa("accountName", e.target.value)} /></div>
              <div><label style={labelStyle}>Classe Asset</label>
                <select style={inputStyle} value={accForm.assetClass} onChange={(e) => fa("assetClass", e.target.value)}>
                  {Object.entries(ASSET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Valuta</label>
                <select style={inputStyle} value={accForm.currency} onChange={(e) => fa("currency", e.target.value)}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                </select>
              </div>
              <div><label style={labelStyle}>Deposito Iniziale</label><input style={inputStyle} type="number" placeholder="0.00" value={accForm.initialDeposit} onChange={(e) => fa("initialDeposit", e.target.value)} /></div>
              <div><label style={labelStyle}>Balance Attuale</label><input style={inputStyle} type="number" placeholder="0.00" value={accForm.balance} onChange={(e) => fa("balance", e.target.value)} /></div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={accForm.notes} onChange={(e) => fa("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => { setShowAddAcc(false); setEditingAcc(null); }}>Annulla</button>
              <button className="btn-primary flex-1" onClick={handleSaveAcc} disabled={saving || !accForm.brokerName || !accForm.balance}>
                {saving ? "Salvo..." : editingAcc ? "Aggiorna" : "Aggiungi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Trade Modal */}
      {showAddTrade && (
        <Modal title="Aggiungi Trade" onClose={() => setShowAddTrade(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label style={labelStyle}>Conto *</label>
                <select style={inputStyle} value={tradeForm.accountId} onChange={(e) => ft("accountId", e.target.value)}>
                  <option value="">Seleziona conto...</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.brokerName} — {a.accountName}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Simbolo *</label><input style={inputStyle} placeholder="es. EURUSD" value={tradeForm.symbol} onChange={(e) => ft("symbol", e.target.value)} /></div>
              <div><label style={labelStyle}>Direzione</label>
                <select style={inputStyle} value={tradeForm.direction} onChange={(e) => ft("direction", e.target.value)}>
                  <option value="LONG">Long</option><option value="SHORT">Short</option>
                </select>
              </div>
              <div><label style={labelStyle}>Data Apertura</label><input style={inputStyle} type="date" value={tradeForm.openDate} onChange={(e) => ft("openDate", e.target.value)} /></div>
              <div><label style={labelStyle}>Data Chiusura (opz.)</label><input style={inputStyle} type="date" value={tradeForm.closeDate} onChange={(e) => ft("closeDate", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Open *</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={tradeForm.openPrice} onChange={(e) => ft("openPrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Close (opz.)</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={tradeForm.closePrice} onChange={(e) => ft("closePrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Size / Lotti *</label><input style={inputStyle} type="number" step="any" placeholder="0.01" value={tradeForm.size} onChange={(e) => ft("size", e.target.value)} /></div>
              <div><label style={labelStyle}>P&L (opz.)</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={tradeForm.pnl} onChange={(e) => ft("pnl", e.target.value)} /></div>
              <div><label style={labelStyle}>P&L % (opz.)</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={tradeForm.pnlPct} onChange={(e) => ft("pnlPct", e.target.value)} /></div>
              <div><label style={labelStyle}>Commissioni</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={tradeForm.fees} onChange={(e) => ft("fees", e.target.value)} /></div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={tradeForm.notes} onChange={(e) => ft("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setShowAddTrade(false)}>Annulla</button>
              <button className="btn-primary flex-1" onClick={handleSaveTrade}
                disabled={saving || !tradeForm.accountId || !tradeForm.symbol || !tradeForm.openPrice || !tradeForm.size}>
                {saving ? "Salvo..." : "Aggiungi Trade"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deletingAcc && (
        <Modal title="Elimina Conto" onClose={() => setDeletingAcc(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#CBD5E1" }}>
                Elimina <strong style={{ color: "#F1F5F9" }}>{deletingAcc.brokerName} — {deletingAcc.accountName}</strong> e tutti i suoi trade. Azione irreversibile.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setDeletingAcc(null)}>Annulla</button>
              <button onClick={handleDeleteAcc} className="btn-red flex-1">Elimina</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
