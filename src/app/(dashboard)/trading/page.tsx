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
  background: "#212946", border: "1px solid #29314f", color: "#bdc8f0",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#8492c4", marginBottom: "6px",
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
      <div className="flex gap-2 justify-end">
        {accounts.length > 0 && (
          <button onClick={() => { setTradeForm(emptyTradeForm); setShowAddTrade(true); }} className="btn-ghost flex items-center gap-2">
            <Plus size={15} /> Aggiungi Trade
          </button>
        )}
        <button onClick={() => { setAccForm(emptyAccForm); setShowAddAcc(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Aggiungi Conto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Balance Totale", value: formatCurrency(totalBalance, "USD"), icon: <DollarSign size={16} />, color: "#90caf9" },
          { label: "P&L Totale", value: formatCurrency(totalPnL, "USD"), icon: totalPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalPnL >= 0 ? "#00e676" : "#f44336" },
          { label: "Conti Attivi", value: String(accounts.filter((a) => a.isActive).length), icon: <Activity size={16} />, color: "#69f0ae" },
          { label: "Trade Registrati", value: String(allTrades.length), icon: <Activity size={16} />, color: "#b39ddb" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            {s.label === "P&L Totale" && (
              <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>{totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%</p>
            )}
          </div>
        ))}
      </div>

      <TabBar tabs={[{ key: "conti", label: "Conti" }, { key: "trades", label: `Trade Log (${allTrades.length})` }]} active={tab} onChange={setTab} />

      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#8492c4" }}>Caricamento...</div>
      ) : tab === "conti" ? (
        accounts.length === 0 ? (
          <div className="card p-10 text-center">
            <TrendingUp size={40} style={{ color: "#8492c4", margin: "0 auto 12px" }} />
            <p className="font-medium" style={{ color: "#d7dcec" }}>Nessun conto trading</p>
            <p className="text-sm mt-1" style={{ color: "#8492c4" }}>Aggiungi il tuo primo conto broker</p>
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
                      <h3 className="font-semibold text-base" style={{ color: "#d7dcec" }}>{acc.brokerName}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>{acc.accountName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditAcc(acc)} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                      <button onClick={() => setDeletingAcc(acc)} className="btn-ghost p-1.5" style={{ color: "#ef9a9a" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Deposito", value: formatCurrency(acc.initialDeposit, acc.currency), color: "#bdc8f0" },
                      { label: "Balance", value: formatCurrency(acc.balance, acc.currency), color: "#bdc8f0" },
                      { label: "P&L", value: `${formatCurrency(pnl, acc.currency)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`, color: pnl >= 0 ? "#00e676" : "#f44336" },
                    ].map((c) => (
                      <div key={c.label} className="rounded-lg p-3" style={{ background: "#212946" }}>
                        <p className="text-xs" style={{ color: "#8492c4" }}>{c.label}</p>
                        <p className="font-semibold text-sm mt-0.5" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center mt-3 pt-3" style={{ borderTop: "1px solid #29314f" }}>
                    <span className="text-xs" style={{ color: "#8492c4" }}>{acc.trades.length} trade registrati</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        allTrades.length === 0 ? (
          <div className="card p-10 text-center">
            <Activity size={40} style={{ color: "#8492c4", margin: "0 auto 12px" }} />
            <p className="font-medium" style={{ color: "#d7dcec" }}>Nessun trade registrato</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #29314f" }}>
                    {["Data", "Conto", "Simbolo", "Dir.", "Open", "Close", "Size", "P&L", "Fees"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#8492c4", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTrades.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #29314f", transition: "background 150ms" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#212946")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 14px", color: "#8492c4", whiteSpace: "nowrap" }}>{formatDate(t.openDate)}</td>
                      <td style={{ padding: "10px 14px", color: "#bdc8f0", whiteSpace: "nowrap" }}>{(t as any)._accName}</td>
                      <td style={{ padding: "10px 14px", color: "#d7dcec", fontWeight: 600 }}>{t.symbol}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span className={t.direction === "LONG" ? "badge badge-green" : "badge badge-red"}>{t.direction}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#bdc8f0" }}>{t.openPrice}</td>
                      <td style={{ padding: "10px 14px", color: "#bdc8f0" }}>{t.closePrice ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#bdc8f0" }}>{t.size}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {t.pnl != null ? (
                          <span style={{ color: t.pnl >= 0 ? "#00e676" : "#f44336", fontWeight: 600 }}>
                            {t.pnl >= 0 ? "+" : ""}{formatCurrency(t.pnl, (t as any)._cur)}
                          </span>
                        ) : <span style={{ color: "#8492c4" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#8492c4" }}>{t.fees > 0 ? formatCurrency(t.fees, (t as any)._cur) : "—"}</td>
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => { setShowAddAcc(false); setEditingAcc(null); }}>Annulla</button>
              <button className="btn-primary" onClick={handleSaveAcc} disabled={saving || !accForm.brokerName || !accForm.balance}>
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setShowAddTrade(false)}>Annulla</button>
              <button className="btn-primary" onClick={handleSaveTrade}
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
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#f44336", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#bdc8f0" }}>
                Elimina <strong style={{ color: "#d7dcec" }}>{deletingAcc.brokerName} — {deletingAcc.accountName}</strong> e tutti i suoi trade. Azione irreversibile.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeletingAcc(null)}>Annulla</button>
              <button onClick={handleDeleteAcc} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
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
