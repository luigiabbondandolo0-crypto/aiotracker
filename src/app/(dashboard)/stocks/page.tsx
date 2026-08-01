"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LineChart, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw } from "lucide-react";

interface StockHolding {
  id: string;
  ticker: string;
  companyName?: string;
  exchange?: string;
  broker?: string;
  units: number;
  avgPrice: number;
  currentPrice?: number;
  currency: string;
  sector?: string;
  country?: string;
  notes?: string;
}

const emptyForm = {
  ticker: "", companyName: "", exchange: "", broker: "",
  units: "", avgPrice: "", currentPrice: "", currency: "USD",
  sector: "", country: "", notes: "",
};

const inputStyle = {
  background: "#162032", border: "1px solid #1E2D42", color: "#CBD5E1",
  borderRadius: "8px", padding: "8px 12px", width: "100%", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "6px",
};

export default function StocksPage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StockHolding | null>(null);
  const [deleting, setDeleting] = useState<StockHolding | null>(null);
  const [updatingPrice, setUpdatingPrice] = useState<StockHolding | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/stocks");
    const data = await res.json();
    setHoldings(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (h: StockHolding) => {
    setForm({
      ticker: h.ticker, companyName: h.companyName ?? "", exchange: h.exchange ?? "",
      broker: h.broker ?? "", units: String(h.units), avgPrice: String(h.avgPrice),
      currentPrice: h.currentPrice ? String(h.currentPrice) : "", currency: h.currency,
      sector: h.sector ?? "", country: h.country ?? "", notes: h.notes ?? "",
    });
    setEditing(h);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/stocks/${editing.id}` : "/api/stocks";
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await fetchData(); setSaving(false); setShowAdd(false); setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/stocks/${deleting.id}`, { method: "DELETE" });
    await fetchData(); setDeleting(null);
  };

  const handleUpdatePrice = async () => {
    if (!updatingPrice || !newPrice) return;
    setSaving(true);
    const h = updatingPrice;
    await fetch(`/api/stocks/${h.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: h.ticker, companyName: h.companyName, exchange: h.exchange, broker: h.broker,
        units: h.units, avgPrice: h.avgPrice, currentPrice: newPrice, currency: h.currency,
        sector: h.sector, country: h.country, notes: h.notes,
      }),
    });
    await fetchData(); setSaving(false); setUpdatingPrice(null); setNewPrice("");
  };

  const totalValue = holdings.reduce((s, h) => s + h.units * (h.currentPrice ?? h.avgPrice), 0);
  const totalCost = holdings.reduce((s, h) => s + h.units * h.avgPrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Premium Hero ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1a1200 0%, #1a1600 40%, #07090F 100%)", border: "1px solid rgba(245,158,11,0.18)", boxShadow: "0 0 60px rgba(180,130,0,0.06), 0 24px 48px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)", top: "-100px", right: "-60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", bottom: "-40px", left: "30%", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#F59E0B", marginBottom: "6px" }}>Azioni</p>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4px" }}>Portfolio Azionario</h1>
              <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px" }}>Valore di mercato</p>
              <p style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: "#FCD34D", letterSpacing: "-0.04em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loading ? "—" : formatCurrency(totalValue, "USD")}</p>
            </div>
            <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#FCD34D", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.12)"; }}>
              <Plus size={14} /> Aggiungi Azione
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: totalGain >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${totalGain >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, fontSize: "11px", fontWeight: 600, color: totalGain >= 0 ? "#6EE7B7" : "#FCA5A5" }}>
              {totalGain >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              P&L: {loading ? "—" : formatCurrency(totalGain, "USD")} ({totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(1)}%)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: "#64748B" }}>
              Costo: {loading ? "—" : formatCurrency(totalCost, "USD")} · {holdings.length} titoli
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
          { label: "Titoli", value: String(holdings.length), icon: <LineChart size={16} />, color: "#6EE7B7" },
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
          <LineChart size={40} style={{ color: "#64748B", margin: "0 auto 12px" }} />
          <p className="font-medium" style={{ color: "#F1F5F9" }}>Nessuna posizione azionaria</p>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Aggiungi le tue azioni al portfolio</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">Aggiungi Azione</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {holdings.map((h) => {
            const price = h.currentPrice ?? h.avgPrice;
            const value = h.units * price;
            const cost = h.units * h.avgPrice;
            const pnl = value - cost;
            const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
            const barWidth = Math.min(Math.abs(pnlPct) * 4, 100);
            return (
              <div key={h.id} className="animate-fade-in" style={{ borderRadius: "16px", background: "#0F172A", border: "1px solid #1E2D42", borderLeft: "3px solid #F59E0B", overflow: "hidden", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px #2D4460, 0 8px 24px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>

                {/* Header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #1E2D42" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                        <span className="badge badge-yellow" style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.03em" }}>{h.ticker}</span>
                        {h.sector && <span className="badge" style={{ fontSize: "10px" }}>{h.sector}</span>}
                      </div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{h.companyName || h.ticker}</h3>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                        {h.units} azioni
                        {h.exchange ? ` · ${h.exchange}` : ""}
                        {` · ${h.currency}`}
                      </p>
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
                      <p style={{ fontSize: "20px", fontWeight: 700, color: "#FCD34D", letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{formatCurrency(value, h.currency)}</p>
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>Medio: {formatCurrency(h.avgPrice, h.currency)}</p>
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
                      <div className="progress-fill" style={{ width: `${barWidth}%`, background: pnl >= 0 ? "linear-gradient(90deg, #B45309, #F59E0B)" : "linear-gradient(90deg, #B91C1C, #EF4444)", boxShadow: pnl >= 0 ? "0 0 8px rgba(245,158,11,0.4)" : "0 0 8px rgba(239,68,68,0.4)" }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #1E2D42", gap: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#64748B" }}>
                      Prezzo attuale:{" "}
                      <button onClick={() => { setUpdatingPrice(h); setNewPrice(h.currentPrice ? String(h.currentPrice) : ""); }}
                        style={{ color: h.currentPrice ? "#FCD34D" : "#3B82F6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "11px", fontFamily: "inherit" }}>
                        {h.currentPrice ? formatCurrency(h.currentPrice, h.currency) : "— imposta"}
                      </button>
                      <RefreshCw size={9} style={{ color: "#64748B", marginLeft: "3px", verticalAlign: "middle", opacity: 0.6 }} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing) && (
        <Modal title={editing ? `Modifica ${editing.ticker}` : "Aggiungi Azione"} onClose={() => { setShowAdd(false); setEditing(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label style={labelStyle}>Ticker *</label><input style={inputStyle} placeholder="es. AAPL" value={form.ticker} onChange={(e) => f("ticker", e.target.value.toUpperCase())} /></div>
              <div><label style={labelStyle}>Azienda</label><input style={inputStyle} placeholder="es. Apple Inc." value={form.companyName} onChange={(e) => f("companyName", e.target.value)} /></div>
              <div><label style={labelStyle}>Exchange</label><input style={inputStyle} placeholder="es. NASDAQ" value={form.exchange} onChange={(e) => f("exchange", e.target.value)} /></div>
              <div><label style={labelStyle}>Broker</label><input style={inputStyle} placeholder="es. Interactive Brokers" value={form.broker} onChange={(e) => f("broker", e.target.value)} /></div>
              <div><label style={labelStyle}>Quantità *</label><input style={inputStyle} type="number" step="any" placeholder="0" value={form.units} onChange={(e) => f("units", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Medio *</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={form.avgPrice} onChange={(e) => f("avgPrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Prezzo Attuale</label><input style={inputStyle} type="number" step="any" placeholder="0.00" value={form.currentPrice} onChange={(e) => f("currentPrice", e.target.value)} /></div>
              <div><label style={labelStyle}>Valuta</label>
                <select style={inputStyle} value={form.currency} onChange={(e) => f("currency", e.target.value)}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                </select>
              </div>
              <div><label style={labelStyle}>Settore</label><input style={inputStyle} placeholder="es. Technology" value={form.sector} onChange={(e) => f("sector", e.target.value)} /></div>
              <div><label style={labelStyle}>Paese</label><input style={inputStyle} placeholder="es. USA" value={form.country} onChange={(e) => f("country", e.target.value)} /></div>
              <div className="col-span-2"><label style={labelStyle}>Note</label><input style={inputStyle} value={form.notes} onChange={(e) => f("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => { setShowAdd(false); setEditing(null); }}>Annulla</button>
              <button className="btn-amber flex-1" onClick={handleSave} disabled={saving || !form.ticker || !form.units || !form.avgPrice}>
                {saving ? "Salvo..." : editing ? "Aggiorna" : "Aggiungi"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Price Modal */}
      {updatingPrice && (
        <Modal title={`Aggiorna Prezzo — ${updatingPrice.ticker}`} onClose={() => setUpdatingPrice(null)}>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Prezzo Attuale ({updatingPrice.currency})</label>
              <input style={inputStyle} type="number" step="any" placeholder="0.00" value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-ghost flex-1" onClick={() => setUpdatingPrice(null)}>Annulla</button>
              <button className="btn-amber flex-1" onClick={handleUpdatePrice} disabled={saving || !newPrice}>
                {saving ? "Salvo..." : "Aggiorna"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal title="Elimina Posizione" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: "#CBD5E1" }}>
                Elimina <strong style={{ color: "#F1F5F9" }}>{deleting.ticker}</strong>{deleting.companyName ? ` (${deleting.companyName})` : ""}. Azione irreversibile.
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
