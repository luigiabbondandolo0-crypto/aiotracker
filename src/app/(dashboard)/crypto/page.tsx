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
  background: "#212946", border: "1px solid #29314f", color: "#bdc8f0",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#8492c4", marginBottom: "6px",
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
      <div className="flex justify-end">
        <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Aggiungi Crypto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Valore Portfolio", value: formatCurrency(totalValue, "USD"), icon: <DollarSign size={16} />, color: "#90caf9" },
          { label: "Costo Totale", value: formatCurrency(totalCost, "USD"), icon: <DollarSign size={16} />, color: "#b39ddb" },
          { label: "P&L Non Realizzato", value: formatCurrency(totalGain, "USD"), icon: totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalGain >= 0 ? "#00e676" : "#f44336" },
          { label: "Asset", value: String(holdings.length), icon: <Bitcoin size={16} />, color: "#ffe57f" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            {s.label === "P&L Non Realizzato" && (
              <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>{totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%</p>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center" style={{ color: "#8492c4" }}>Caricamento...</div>
      ) : holdings.length === 0 ? (
        <div className="card p-10 text-center">
          <Bitcoin size={40} style={{ color: "#8492c4", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#d7dcec" }}>Nessuna crypto</p>
          <p className="text-sm mt-1" style={{ color: "#8492c4" }}>Aggiungi le tue criptovalute al portfolio</p>
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

            return (
              <div key={h.id} className="card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {h.exchange && <span className="badge badge-purple">{h.exchange}</span>}
                      {h.wallet && <span className="badge">{h.wallet}</span>}
                    </div>
                    <h3 className="font-bold text-xl" style={{ color: "#d7dcec" }}>{h.symbol}</h3>
                    {h.name && <p className="text-xs mt-0.5" style={{ color: "#8492c4" }}>{h.name}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(h)} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleting(h)} className="btn-ghost p-1.5" style={{ color: "#ef9a9a" }}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-3" style={{ background: "#212946" }}>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Quantità</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#bdc8f0" }}>{h.amount}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#212946" }}>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Valore</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#d7dcec" }}>{formatCurrency(value, h.currency)}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#212946" }}>
                    <p className="text-xs" style={{ color: "#8492c4" }}>Prezzo Medio</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#8492c4" }}>{formatCurrency(h.avgBuyPrice, h.currency)}</p>
                  </div>
                  <div className="rounded-lg p-3 cursor-pointer" style={{ background: "#212946" }}
                    onClick={() => { setUpdatingPrice(h); setNewPrice(h.currentPrice ? String(h.currentPrice) : ""); }}
                    title="Clicca per aggiornare">
                    <div className="flex items-center gap-1">
                      <p className="text-xs" style={{ color: "#8492c4" }}>Prezzo Attuale</p>
                      <RefreshCw size={10} style={{ color: "#8492c4", opacity: 0.6 }} />
                    </div>
                    <p className="font-semibold mt-0.5" style={{ color: "#bdc8f0" }}>
                      {h.currentPrice ? formatCurrency(h.currentPrice, h.currency) : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid #29314f" }}>
                  <div>
                    <p style={{ color: pnl >= 0 ? "#00e676" : "#f44336", fontWeight: 600, fontSize: "14px" }}>
                      {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, h.currency)}
                    </p>
                    <p className="text-xs" style={{ color: pnlPct >= 0 ? "#00e676" : "#f44336" }}>
                      {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                    </p>
                  </div>
                  <button onClick={() => { setTxTarget(h); setTxForm(emptyTxForm); }}
                    className="btn-ghost text-xs flex items-center gap-1.5" style={{ color: "#90caf9" }}>
                    <Plus size={12} /> Aggiungi TX
                  </button>
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.symbol || !form.amount || !form.avgBuyPrice}>
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
            <div className="flex gap-2 justify-end pt-2">
              <button className="btn-ghost" onClick={() => setTxTarget(null)}>Annulla</button>
              <button className="btn-primary" onClick={handleTx} disabled={saving || !txForm.amount || !txForm.price}>
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
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setUpdatingPrice(null)}>Annulla</button>
              <button className="btn-primary" onClick={handleUpdatePrice} disabled={saving || !newPrice}>
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
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#f44336", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#bdc8f0" }}>
                Elimina <strong style={{ color: "#d7dcec" }}>{deleting.symbol}{deleting.name ? ` (${deleting.name})` : ""}</strong>. Azione irreversibile.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeleting(null)}>Annulla</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
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
