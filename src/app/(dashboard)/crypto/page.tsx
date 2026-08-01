"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Bitcoin, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw } from "lucide-react";

type CryptoTxType = "BUY" | "SELL" | "TRANSFER_IN" | "TRANSFER_OUT" | "STAKE_REWARD" | "AIRDROP";

interface CryptoTransaction {
  id: string;
  type: CryptoTxType;
  date: string;
  amount: number;
  price: number;
  fees: number;
  total: number;
  notes?: string;
}

interface CryptoHolding {
  id: string;
  symbol: string;
  name?: string;
  exchange?: string;
  wallet?: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice?: number;
  currency: string;
  notes?: string;
  cryptoTransactions: CryptoTransaction[];
}

const TX_LABELS: Record<CryptoTxType, string> = {
  BUY: "Acquisto", SELL: "Vendita", TRANSFER_IN: "Entrata",
  TRANSFER_OUT: "Uscita", STAKE_REWARD: "Staking", AIRDROP: "Airdrop",
};

const emptyForm = {
  symbol: "", name: "", exchange: "", wallet: "",
  amount: "", avgBuyPrice: "", currentPrice: "", currency: "USD", notes: "",
};

const emptyTxForm = {
  type: "BUY" as CryptoTxType,
  date: new Date().toISOString().slice(0, 10),
  amount: "", price: "", fees: "", total: "", notes: "",
};

const inputStyle = {
  background: "#162032", border: "1px solid #1E2D42", color: "#CBD5E1",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "6px",
};

export default function CryptoPage() {
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CryptoHolding | null>(null);
  const [deleting, setDeleting] = useState<CryptoHolding | null>(null);
  const [txTarget, setTxTarget] = useState<CryptoHolding | null>(null);
  const [updatingPrice, setUpdatingPrice] = useState<CryptoHolding | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [txForm, setTxForm] = useState(emptyTxForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/crypto");
    const data = await res.json();
    setHoldings(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const ft = (k: string, v: string) => setTxForm((p) => ({ ...p, [k]: v }));

  const openEdit = (h: CryptoHolding) => {
    setForm({
      symbol: h.symbol, name: h.name ?? "", exchange: h.exchange ?? "",
      wallet: h.wallet ?? "", amount: String(h.amount), avgBuyPrice: String(h.avgBuyPrice),
      currentPrice: h.currentPrice ? String(h.currentPrice) : "", currency: h.currency,
      notes: h.notes ?? "",
    });
    setEditing(h);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/crypto/${editing.id}` : "/api/crypto";
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await fetchData(); setSaving(false); setShowAdd(false); setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/crypto/${deleting.id}`, { method: "DELETE" });
    await fetchData(); setDeleting(null);
  };

  const handleTx = async () => {
    if (!txTarget) return;
    setSaving(true);
    const amount = parseFloat(txForm.amount);
    const price = parseFloat(txForm.price);
    await fetch(`/api/crypto/${txTarget.id}/transactions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...txForm, total: amount * price }),
    });
    await fetchData(); setSaving(false); setTxTarget(null); setTxForm(emptyTxForm);
  };

  const handleUpdatePrice = async () => {
    if (!updatingPrice || !newPrice) return;
    setSaving(true);
    const h = updatingPrice;
    await fetch(`/api/crypto/${h.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: h.symbol, name: h.name, exchange: h.exchange, wallet: h.wallet,
        amount: h.amount, avgBuyPrice: h.avgBuyPrice, currentPrice: newPrice,
        currency: h.currency, notes: h.notes,
      }),
    });
    await fetchData(); setSaving(false); setUpdatingPrice(null); setNewPrice("");
  };

  const totalValue = holdings.reduce((s, h) => s + h.amount * (h.currentPrice ?? h.avgBuyPrice), 0);
  const totalCost = holdings.reduce((s, h) => s + h.amount * h.avgBuyPrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Premium Hero ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1a0a00 0%, #1a1000 40%, #07090F 100%)", border: "1px solid rgba(239,68,68,0.15)", boxShadow: "0 0 60px rgba(180,60,0,0.06), 0 24px 48px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)", top: "-100px", right: "-60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", bottom: "-40px", left: "30%", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#EF4444", marginBottom: "6px" }}>Crypto</p>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4px" }}>Holdings Crypto</h1>
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px" }}>Valore di mercato</p>
              <p style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: "#FCA5A5", letterSpacing: "-0.04em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loading ? "—" : formatCurrency(totalValue, "USD")}</p>
            </div>
            <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", color: "#FCA5A5", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}>
              <Plus size={14} /> Aggiungi Crypto
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: totalGain >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${totalGain >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, fontSize: "11px", fontWeight: 600, color: totalGain >= 0 ? "#6EE7B7" : "#FCA5A5" }}>
              {totalGain >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              P&L: {loading ? "—" : formatCurrency(totalGain, "USD")} ({totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(1)}%)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: "#64748B" }}>
              Costo: {loading ? "—" : formatCurrency(totalCost, "USD")} · {holdings.length} asset
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Valore Portfolio", value: formatCurrency(totalValue, "USD"), icon: <DollarSign size={16} />, color: "#93C5FD" },
          { label: "Costo Totale", value: formatCurrency(totalCost, "USD"), icon: <DollarSign size={16} />, color: "#C4B5FD" },
          { label: "P&L Non Realizzato", value: formatCurrency(totalGain, "USD"), icon: totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalGain >= 0 ? "#10B981" : "#EF4444" },
          { label: "Asset", value: String(holdings.length), icon: <Bitcoin size={16} />, color: "#FCD34D" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", lineHeight: 1 }}>{s.label}</p>
              <span style={{ color: s.color, opacity: 0.75 }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{s.icon}</span>
            </div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{s.value}</p>
            {s.label === "P&L Non Realizzato" && (
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%</p>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#64748B" }}>Caricamento...</div>
      ) : holdings.length === 0 ? (
        <div className="card p-10 text-center">
          <Bitcoin size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessuna crypto</p>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Aggiungi le tue criptovalute al portfolio</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">Aggiungi Crypto</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {holdings.map((h) => {
            const price = h.currentPrice ?? h.avgBuyPrice;
            const value = h.amount * price;
            const cost = h.amount * h.avgBuyPrice;
            const pnl = value - cost;
            const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
            const barWidth = Math.min(Math.abs(pnlPct) * 3, 100);

            return (
              <div key={h.id} className="animate-fade-in" style={{ borderRadius: "16px", background: "#0F172A", border: "1px solid #1E2D42", borderLeft: "3px solid #EF4444", overflow: "hidden", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px #2D4460, 0 8px 24px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>

                {/* Header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #1E2D42" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px", flexWrap: "wrap" }}>
                        {h.exchange && <span className="badge badge-purple">{h.exchange}</span>}
                        {h.wallet && <span className="badge">{h.wallet}</span>}
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", lineHeight: 1 }}>{h.symbol}</h3>
                      {h.name && <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{h.name}</p>}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button onClick={() => openEdit(h)} className="btn-icon"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleting(h)} className="btn-icon danger"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "4px" }}>Valore</p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: "#FCA5A5", letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{formatCurrency(value, h.currency)}</p>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>{h.amount} {h.symbol}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "4px" }}>P&amp;L</p>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: pnl >= 0 ? "#6EE7B7" : "#FCA5A5", lineHeight: 1, whiteSpace: "nowrap" }}>
                        {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, h.currency)}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: pnl >= 0 ? "#10B981" : "#EF4444", marginTop: "2px" }}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${barWidth}%`, background: pnl >= 0 ? "linear-gradient(90deg, #059669, #10B981)" : "linear-gradient(90deg, #B91C1C, #EF4444)", boxShadow: pnl >= 0 ? "0 0 8px rgba(16,185,129,0.4)" : "0 0 8px rgba(239,68,68,0.4)" }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #1E2D42", gap: "8px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#64748B" }}>
                        Medio: <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{formatCurrency(h.avgBuyPrice, h.currency)}</span>
                      </p>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                        Attuale: <button onClick={() => { setUpdatingPrice(h); setNewPrice(h.currentPrice ? String(h.currentPrice) : ""); }}
                          style={{ color: h.currentPrice ? "#CBD5E1" : "#3B82F6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "11px", fontFamily: "inherit" }}>
                          {h.currentPrice ? formatCurrency(h.currentPrice, h.currency) : "— imposta"}
                        </button>
                        <RefreshCw size={9} style={{ color: "#64748B", marginLeft: "3px", verticalAlign: "middle", opacity: 0.6 }} />
                      </p>
                    </div>
                    <button onClick={() => { setTxTarget(h); setTxForm(emptyTxForm); }}
                      className="btn-pill" style={{ color: "#93C5FD", borderColor: "rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.08)", flexShrink: 0 }}>
                      <Plus size={11} /> TX
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing) && (
        <Modal title={editing ? `Modifica ${editing.symbol}` : "Aggiungi Crypto"} onClose={() => { setShowAdd(false); setEditing(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label style={labelStyle}>Simbolo *</label><input style={inputStyle} placeholder="es. BTC, ETH" value={form.symbol} onChange={(e) => f("symbol", e.target.value.toUpperCase())} /></div>
              <div><label style={labelStyle}>Nome</label><input style={inputStyle} placeholder="es. Bitcoin" value={form.name} onChange={(e) => f("name", e.target.value)} /></div>
              <div><label style={labelStyle}>Exchange</label><input style={inputStyle} placeholder="es. Binance, Kraken" value={form.exchange} onChange={(e) => f("exchange", e.target.value)} /></div>
              <div><label style={labelStyle}>Wallet</label><input style={inputStyle} placeholder="es. Ledger, MetaMask" value={form.wallet} onChange={(e) => f("wallet", e.target.value)} /></div>
              <div><label style={labelStyle}>Quantità *</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={form.amount} onChange={(e) => f("amount", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Medio Acquisto *</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={form.avgBuyPrice} onChange={(e) => f("avgBuyPrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Attuale</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={form.currentPrice} onChange={(e) => f("currentPrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Valuta</label>
                <select style={inputStyle} value={form.currency} onChange={(e) => f("currency", e.target.value)}>
                  <option value="USD">USD</option><option value="EUR">EUR</option>
                </select>
              </div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={form.notes} onChange={(e) => f("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-red flex-1" onClick={handleSave} disabled={saving || !form.symbol || !form.amount || !form.avgBuyPrice}>
                {saving ? "Salvo..." : editing ? "Aggiorna" : "Aggiungi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Transaction Modal */}
      {txTarget && (
        <Modal title={`Nuova TX — ${txTarget.symbol}`} onClose={() => setTxTarget(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label style={labelStyle}>Tipo</label>
                <select style={inputStyle} value={txForm.type} onChange={(e) => ft("type", e.target.value)}>
                  {Object.entries(TX_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Data</label><input style={inputStyle} type="date" value={txForm.date} onChange={(e) => ft("date", e.target.value)} /></div>
              <div><label style={labelStyle}>Quantità</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={txForm.amount} onChange={(e) => ft("amount", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={txForm.price} onChange={(e) => ft("price", e.target.value)} /></div>
              <div><label style={labelStyle}>Commissioni</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={txForm.fees} onChange={(e) => ft("fees", e.target.value)} /></div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={txForm.notes} onChange={(e) => ft("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setTxTarget(null)}>Annulla</button>
              <button className="btn-red flex-1" onClick={handleTx} disabled={saving || !txForm.amount || !txForm.price}>
                {saving ? "Salvo..." : "Aggiungi TX"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Price Modal */}
      {updatingPrice && (
        <Modal title={`Aggiorna Prezzo — ${updatingPrice.symbol}`} onClose={() => setUpdatingPrice(null)}>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Prezzo Attuale ({updatingPrice.currency})</label>
              <input style={inputStyle} type="number" step="any" placeholder="0.00" value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setUpdatingPrice(null)}>Annulla</button>
              <button className="btn-red flex-1" onClick={handleUpdatePrice} disabled={saving || !newPrice}>
                {saving ? "Salvo..." : "Aggiorna"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal title="Elimina Holding" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#CBD5E1" }}>
                Elimina <strong style={{ color: "#F1F5F9" }}>{deleting.symbol}{deleting.name ? ` (${deleting.name})` : ""}</strong>. Azione irreversibile.
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
