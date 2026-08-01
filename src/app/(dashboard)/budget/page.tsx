"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { TabBar } from "@/components/ui/TabBar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Home, ShoppingCart,
  BarChart2, Shield, Droplets, AlertTriangle, ChevronLeft, ChevronRight,
  LayoutDashboard, Wallet, Receipt, SlidersHorizontal,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IncomeSource {
  id: string; name: string; taxRate: number; isTaxed: boolean; color: string;
}
interface IncomeEntry {
  id: string; sourceId: string; grossAmount: number; taxAmount: number;
  netAmount: number; taxRate: number; date: string; description?: string;
  source: IncomeSource;
}
interface Expense {
  id: string; category: string; amount: number; description?: string; date: string;
}
interface Allocation { category: string; percentage: number; }

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "SPESE_NECESSARIE",  label: "Spese Necessarie",  Icon: Home,         color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",  bar: "blue" as const },
  { key: "SPESE_GIORNALIERE", label: "Spese Giornaliere", Icon: ShoppingCart, color: "#C4B5FD", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",  bar: "purple" as const },
  { key: "INVESTIMENTI",      label: "Investimenti",      Icon: BarChart2,    color: "#6EE7B7", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.2)",   bar: "green" as const },
  { key: "FONDO_EMERGENZA",   label: "Fondo Emergenza",   Icon: Shield,       color: "#FCD34D", bg: "rgba(255,193,7,0.08)",   border: "rgba(255,193,7,0.2)",   bar: "yellow" as const },
  { key: "LIQUIDITA",         label: "Liquidità",         Icon: Droplets,     color: "#80deea", bg: "rgba(0,188,212,0.08)",   border: "rgba(0,188,212,0.2)",   bar: "blue" as const },
];

const PALETTE = [
  "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444",
  "#06b6d4","#f97316","#ec4899","#84cc16","#6366f1",
];

const TABS = [
  { key: "overview" as const, label: "Overview",  icon: <LayoutDashboard size={13} /> },
  { key: "entrate" as const,  label: "Entrate",   icon: <TrendingUp size={13} /> },
  { key: "spese"   as const,  label: "Spese",     icon: <Receipt size={13} /> },
  { key: "budget"  as const,  label: "Budget",    icon: <SlidersHorizontal size={13} /> },
  { key: "tasse"   as const,  label: "Tasse",     icon: <Wallet size={13} /> },
];

type Tab = typeof TABS[number]["key"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const now = new Date();
  const [tab, setTab] = useState<Tab>("overview");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>(
    CATEGORIES.map((c) => ({ category: c.key, percentage: 0 }))
  );
  const [loading, setLoading] = useState(false);

  // ── modals
  const [modal, setModal] = useState<"source" | "entry" | "expense" | null>(null);

  // ── forms
  const [sourceForm, setSourceForm] = useState({ name: "", taxRate: 0, isTaxed: false, color: PALETTE[0] });
  const [entryForm, setEntryForm]   = useState({ sourceId: "", grossAmount: "", date: now.toISOString().split("T")[0], description: "", currency: "EUR" as "EUR" | "USD", eurUsdRate: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "SPESE_NECESSARIE", amount: "", description: "", date: now.toISOString().split("T")[0] });

  const fetchAll = useCallback(async () => {
    const [s, e, ex, al] = await Promise.all([
      fetch("/api/income-sources").then((r) => r.json()),
      fetch(`/api/income-entries?month=${month}&year=${year}`).then((r) => r.json()),
      fetch(`/api/expenses?month=${month}&year=${year}`).then((r) => r.json()),
      fetch(`/api/budget-allocations?month=${month}&year=${year}`).then((r) => r.json()),
    ]);
    setSources(Array.isArray(s) ? s : []);
    setEntries(Array.isArray(e) ? e : []);
    setExpenses(Array.isArray(ex) ? ex : []);
    if (Array.isArray(al) && al.length > 0) {
      setAllocations(CATEGORIES.map((c) => {
        const found = al.find((a: Allocation) => a.category === c.key);
        return { category: c.key, percentage: found?.percentage ?? 0 };
      }));
    }
  }, [month, year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Computed
  const totalGross    = entries.reduce((s, e) => s + e.grossAmount, 0);
  const totalTax      = entries.reduce((s, e) => s + e.taxAmount, 0);
  const totalNet      = entries.reduce((s, e) => s + e.netAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const allocTotal    = allocations.reduce((s, a) => s + a.percentage, 0);

  // ── preview entrata
  const previewSrc = sources.find((s) => s.id === entryForm.sourceId);
  const previewRawG = Number(entryForm.grossAmount) || 0;
  const previewRate = Number(entryForm.eurUsdRate) || 0;
  const previewG    = entryForm.currency === "USD" && previewRate > 0 ? previewRawG / previewRate : previewRawG;
  const previewT   = previewSrc?.isTaxed ? previewG * (previewSrc.taxRate / 100) : 0;
  const previewN   = previewG - previewT;

  // ── Handlers
  async function addSource() {
    setLoading(true);
    await fetch("/api/income-sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sourceForm) });
    setModal(null); setSourceForm({ name: "", taxRate: 0, isTaxed: false, color: PALETTE[0] });
    await fetchAll(); setLoading(false);
  }
  async function addEntry() {
    setLoading(true);
    let grossAmount = Number(entryForm.grossAmount);
    if (entryForm.currency === "USD" && entryForm.eurUsdRate) {
      const rate = Number(entryForm.eurUsdRate);
      if (rate > 0) grossAmount = grossAmount / rate;
    }
    await fetch("/api/income-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...entryForm, grossAmount }) });
    setModal(null); setEntryForm({ sourceId: "", grossAmount: "", date: now.toISOString().split("T")[0], description: "", currency: "EUR", eurUsdRate: "" });
    await fetchAll(); setLoading(false);
  }
  async function addExpense() {
    setLoading(true);
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(expenseForm) });
    setModal(null); setExpenseForm({ category: "SPESE_NECESSARIE", amount: "", description: "", date: now.toISOString().split("T")[0] });
    await fetchAll(); setLoading(false);
  }
  async function deleteEntry(id: string) { await fetch(`/api/income-entries/${id}`, { method: "DELETE" }); fetchAll(); }
  async function deleteExpense(id: string) { await fetch(`/api/expenses/${id}`, { method: "DELETE" }); fetchAll(); }
  async function deleteSource(id: string) { await fetch(`/api/income-sources/${id}`, { method: "DELETE" }); fetchAll(); }
  async function saveAllocations() {
    if (Math.round(allocTotal) !== 100) return;
    setLoading(true);
    await fetch("/api/budget-allocations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, year, allocations }) });
    setLoading(false);
  }

  function prevMonth() { const d = new Date(year, month - 2); setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }
  function nextMonth() { const d = new Date(year, month); setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }
  const monthName = new Date(year, month - 1).toLocaleString("it-IT", { month: "long", year: "numeric" });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-8">
      {/* ── Premium Hero ──────────────────────────────────────────────────── */}
      {(() => {
        const saldo = totalNet - totalExpenses;
        const positive = saldo >= 0;
        return (
          <div className="animate-fade-in" style={{ borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", background: positive ? "linear-gradient(135deg, #051a12 0%, #0a1f18 40%, #07090F 100%)" : "linear-gradient(135deg, #1a0505 0%, #1a0808 40%, #07090F 100%)", border: `1px solid ${positive ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)"}`, boxShadow: `0 0 60px ${positive ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)"}, 0 24px 48px rgba(0,0,0,0.4)` }}>
            <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", background: `radial-gradient(circle, ${positive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)"} 0%, transparent 70%)`, top: "-100px", right: "-60px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", bottom: "-40px", left: "30%", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: positive ? "#10B981" : "#EF4444", marginBottom: "6px" }}>Budget & Spese</p>
                  <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "4px" }}>Riepilogo Mensile</h1>
                  <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px", textTransform: "capitalize" }}>{monthName}</p>
                  <p style={{ fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: positive ? "#6EE7B7" : "#FCA5A5", letterSpacing: "-0.04em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loading ? "—" : formatCurrency(saldo)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                  <button onClick={prevMonth} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "transparent", border: "none", color: "#64748B", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#CBD5E1"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#CBD5E1", padding: "0 8px", minWidth: "120px", textAlign: "center", textTransform: "capitalize" }}>{monthName}</span>
                  <button onClick={nextMonth} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "transparent", border: "none", color: "#64748B", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#CBD5E1"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                {[
                  { label: `Netto: ${loading ? "—" : formatCurrency(totalNet)}`, color: "#6EE7B7" },
                  { label: `Spese: ${loading ? "—" : formatCurrency(totalExpenses)}`, color: "#FCA5A5" },
                  { label: `Lordo: ${loading ? "—" : formatCurrency(totalGross)}`, color: "#CBD5E1" },
                ].map(b => (
                  <span key={b.label} style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: b.color }}>{b.label}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="animate-fade-in delay-100">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4 animate-fade-in-scale">
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Entrate Lorde", value: formatCurrency(totalGross), color: "#F1F5F9",  border: "#1E2D42" },
              { label: "Tasse",         value: `-${formatCurrency(totalTax)}`, color: "#FCA5A5", border: "rgba(239,68,68,0.2)" },
              { label: "Netto",         value: formatCurrency(totalNet),   color: "#6EE7B7",  border: "rgba(16,185,129,0.2)" },
              { label: "Spese",         value: formatCurrency(totalExpenses), color: totalExpenses > totalNet ? "#FCA5A5" : "#FCD34D", border: "#1E2D42" },
            ].map((k, i) => (
              <div key={k.label} className="card animate-fade-in" style={{ padding: "14px 16px", overflow: "hidden", animationDelay: `${i * 60}ms`, borderColor: k.border }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "10px", lineHeight: 1 }}>{k.label}</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: k.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Saldo */}
          {(() => {
            const saldo = totalNet - totalExpenses;
            const positive = saldo >= 0;
            return (
              <div className="rounded-2xl animate-fade-in delay-200"
                style={{ padding: "20px 24px", background: positive ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${positive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B", marginBottom: "8px" }}>Saldo del Mese</p>
                  <p style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: positive ? "#6EE7B7" : "#FCA5A5", letterSpacing: "-0.03em", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatCurrency(saldo)}</p>
                  <p style={{ fontSize: "12px", color: "#64748B", marginTop: "6px" }}>Netto {formatCurrency(totalNet)} − Spese {formatCurrency(totalExpenses)}</p>
                </div>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: positive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", flexShrink: 0 }}>
                  {positive
                    ? <TrendingUp size={20} style={{ color: "#6EE7B7" }} />
                    : <TrendingDown size={20} style={{ color: "#FCA5A5" }} />
                  }
                </div>
              </div>
            );
          })()}

          {/* Allocazione */}
          {allocations.some((a) => a.percentage > 0) && totalNet > 0 && (
            <div className="card p-5 animate-fade-in delay-300">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "#F1F5F9" }}>Allocazione Budget</h3>
              <div className="space-y-4">
                {CATEGORIES.map((cat) => {
                  const alloc = allocations.find((a) => a.category === cat.key);
                  const pct = alloc?.percentage ?? 0;
                  const allocated = totalNet * (pct / 100);
                  const spent = expenses.filter((e) => e.category === cat.key).reduce((s, e) => s + e.amount, 0);
                  const usedPct = allocated > 0 ? (spent / allocated) * 100 : 0;
                  const barColor = usedPct >= 100 ? "red" : usedPct >= 80 ? "yellow" : cat.bar;
                  return (
                    <div key={cat.key}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <cat.Icon size={13} style={{ color: cat.color }} />
                          <span className="text-xs font-medium" style={{ color: "#CBD5E1" }}>{cat.label}</span>
                          <span className="badge" style={{ fontSize: "10px", padding: "1px 6px", background: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}>{pct}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold" style={{ color: usedPct >= 100 ? "#FCA5A5" : "#F1F5F9" }}>{formatCurrency(spent)}</span>
                          <span className="text-xs ml-1" style={{ color: "#64748B" }}>/ {formatCurrency(allocated)}</span>
                        </div>
                      </div>
                      <ProgressBar value={usedPct} color={barColor} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ENTRATE ──────────────────────────────────────────────────────── */}
      {tab === "entrate" && (
        <div className="space-y-4 animate-fade-in-scale">
          {/* Fonti */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Fonti di Reddito</h3>
              <button onClick={() => setModal("source")} className="btn-primary flex items-center gap-1.5" style={{ padding: "7px 14px", fontSize: "12px" }}>
                <Plus size={12} /> Aggiungi
              </button>
            </div>
            {sources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm mb-1" style={{ color: "#64748B" }}>Nessuna fonte</p>
                <p className="text-xs" style={{ color: "#64748B" }}>Crea la prima fonte di reddito</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {sources.map((s, i) => (
                  <div key={s.id} className="group rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, background: "#162032", border: "1px solid #1E2D42" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
                      <span className="text-sm font-medium truncate flex-1 min-w-0" style={{ color: "#F1F5F9" }}>{s.name}</span>
                      <button onClick={() => deleteSource(s.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0" style={{ color: "#64748B" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {s.isTaxed
                      ? <span className="badge badge-red" style={{ fontSize: "10px" }}>Tassato {s.taxRate}%</span>
                      : <span className="badge badge-green" style={{ fontSize: "10px" }}>Non tassato</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entrate lista */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Entrate <span className="font-normal capitalize" style={{ color: "#64748B" }}>· {monthName}</span></h3>
              <button onClick={() => setModal("entry")} className="btn-primary flex items-center gap-1.5" style={{ padding: "7px 14px", fontSize: "12px" }}>
                <Plus size={12} /> Aggiungi
              </button>
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={28} className="mx-auto mb-2" style={{ color: "#1E2D42" }} />
                <p className="text-sm" style={{ color: "#64748B" }}>Nessuna entrata per questo mese</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((e, i) => (
                  <div key={e.id} className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-150 animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms`, background: "#162032", border: "1px solid #1E2D42" }}
                    onMouseEnter={(el) => (el.currentTarget.style.borderColor = "#2D4460")}
                    onMouseLeave={(el) => (el.currentTarget.style.borderColor = "#1E2D42")}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.source.color, boxShadow: `0 0 6px ${e.source.color}60` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{e.source.name}</p>
                      {e.description && <p className="text-xs truncate" style={{ color: "#64748B" }}>{e.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>{formatCurrency(e.grossAmount)}</p>
                      {e.taxAmount > 0 && <p className="text-xs" style={{ color: "#FCA5A5" }}>-{formatCurrency(e.taxAmount)}</p>}
                      {e.taxAmount > 0 && <p className="text-xs font-medium" style={{ color: "#6EE7B7" }}>{formatCurrency(e.netAmount)} netto</p>}
                    </div>
                    <button onClick={() => deleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition cursor-pointer" style={{ color: "#64748B" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3" style={{ borderTop: "1px solid #1E2D42" }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>Totale</span>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{formatCurrency(totalGross)} lordo</p>
                    {totalTax > 0 && <><p className="text-xs" style={{ color: "#FCA5A5" }}>-{formatCurrency(totalTax)} tasse</p><p className="text-sm font-bold" style={{ color: "#6EE7B7" }}>{formatCurrency(totalNet)} netto</p></>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SPESE ────────────────────────────────────────────────────────── */}
      {tab === "spese" && (
        <div className="space-y-4 animate-fade-in-scale">
          <div className="card p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Spese <span className="font-normal capitalize" style={{ color: "#64748B" }}>· {monthName}</span></h3>
              <button onClick={() => setModal("expense")} className="btn-primary flex items-center gap-1.5" style={{ padding: "7px 14px", fontSize: "12px" }}>
                <Plus size={12} /> Aggiungi
              </button>
            </div>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={28} className="mx-auto mb-2" style={{ color: "#1E2D42" }} />
                <p className="text-sm" style={{ color: "#64748B" }}>Nessuna spesa per questo mese</p>
              </div>
            ) : (
              <>
                {CATEGORIES.map((cat) => {
                  const catExp = expenses.filter((e) => e.category === cat.key);
                  if (!catExp.length) return null;
                  const total = catExp.reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={cat.key} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                          <cat.Icon size={12} style={{ color: cat.color }} />
                          <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: cat.color }}>{formatCurrency(total)}</span>
                      </div>
                      <div className="space-y-1.5">
                        {catExp.map((e, i) => (
                          <div key={e.id} className="group flex items-center gap-3 rounded-xl p-3 animate-fade-in"
                            style={{ animationDelay: `${i * 50}ms`, background: "#162032", border: "1px solid #1E2D42" }}
                            onMouseEnter={(el) => (el.currentTarget.style.borderColor = "#2d3f55")}
                            onMouseLeave={(el) => (el.currentTarget.style.borderColor = "#1E2D42")}>
                            <div className="flex-1">
                              <p className="text-sm" style={{ color: "#F1F5F9" }}>{e.description || "—"}</p>
                              <p className="text-xs" style={{ color: "#64748B" }}>{new Date(e.date).toLocaleDateString("it-IT")}</p>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>{formatCurrency(e.amount)}</span>
                            <button onClick={() => deleteExpense(e.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition cursor-pointer" style={{ color: "#64748B" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-3" style={{ borderTop: "1px solid #1E2D42" }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>Totale spese</span>
                  <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{formatCurrency(totalExpenses)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BUDGET ───────────────────────────────────────────────────────── */}
      {tab === "budget" && (
        <div className="space-y-4 animate-fade-in-scale">
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>Allocazione Budget</h3>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Distribuisci il netto mensile · {formatCurrency(totalNet)}</p>
            </div>
            <div className="space-y-3">
              {CATEGORIES.map((cat, i) => {
                const alloc = allocations.find((a) => a.category === cat.key);
                const pct = alloc?.percentage ?? 0;
                const amount = totalNet * (pct / 100);
                return (
                  <div key={cat.key} className="rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms`, background: cat.bg, border: `1px solid ${cat.border}` }}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <cat.Icon size={14} style={{ color: cat.color }} />
                        <span className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{formatCurrency(amount)}</span>
                        <span className="text-xs ml-1.5 font-bold" style={{ color: cat.color }}>{pct}%</span>
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={100} value={pct}
                      onChange={(e) => setAllocations((prev) => prev.map((a) => a.category === cat.key ? { ...a, percentage: Number(e.target.value) } : a))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: cat.color }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between items-center p-3 rounded-xl"
              style={{ background: Math.round(allocTotal) === 100 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${Math.round(allocTotal) === 100 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
              <span className="text-sm font-medium" style={{ color: "#CBD5E1" }}>Totale allocato</span>
              <span className="text-lg font-bold" style={{ color: Math.round(allocTotal) === 100 ? "#6EE7B7" : "#FCA5A5" }}>{allocTotal.toFixed(0)}%</span>
            </div>

            {Math.round(allocTotal) !== 100 && (
              <div className="flex items-center gap-2 mt-2 animate-fade-in">
                <AlertTriangle size={12} className="text-yellow-400" />
                <p className="text-xs text-yellow-400">Le percentuali devono sommare esattamente a 100%</p>
              </div>
            )}

            <button onClick={saveAllocations} disabled={Math.round(allocTotal) !== 100 || loading}
              className="btn-green w-full mt-4 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
              {loading ? "Salvataggio..." : "Salva Allocazione"}
            </button>
          </div>
        </div>
      )}

      {/* ── TASSE ────────────────────────────────────────────────────────── */}
      {tab === "tasse" && (
        <div className="space-y-4 animate-fade-in-scale">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Lordo", value: formatCurrency(totalGross), color: "#F1F5F9" },
              { label: "Tasse", value: `-${formatCurrency(totalTax)}`, color: "#FCA5A5" },
              { label: "Netto", value: formatCurrency(totalNet), color: "#6EE7B7" },
            ].map((k, i) => (
              <div key={k.label} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>{k.label}</p>
                <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="card p-5 animate-fade-in delay-200">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#F1F5F9" }}>Dettaglio per Fonte</h3>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "#64748B" }}>Nessuna entrata per questo mese</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((e, i) => (
                  <div key={e.id} className="rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms`, background: "#162032", border: "1px solid #1E2D42" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: e.source.color, boxShadow: `0 0 6px ${e.source.color}60` }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{e.source.name}</p>
                          {e.description && <p className="text-xs" style={{ color: "#64748B" }}>{e.description}</p>}
                          <p className="text-xs" style={{ color: "#64748B" }}>{new Date(e.date).toLocaleDateString("it-IT")}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm" style={{ color: "#F1F5F9" }}>Lordo: <span className="font-semibold">{formatCurrency(e.grossAmount)}</span></p>
                        {e.taxAmount > 0
                          ? <>
                              <p className="text-xs" style={{ color: "#FCA5A5" }}>Tasse ({e.taxRate}%): -{formatCurrency(e.taxAmount)}</p>
                              <p className="text-sm font-bold" style={{ color: "#6EE7B7" }}>Netto: {formatCurrency(e.netAmount)}</p>
                            </>
                          : <p className="badge badge-green text-xs mt-1">Non tassato</p>
                        }
                      </div>
                    </div>
                  </div>
                ))}
                {totalTax > 0 && (
                  <div className="flex items-center gap-3 mt-3 p-4 rounded-xl animate-fade-in"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle size={16} className="flex-shrink-0" style={{ color: "#FCA5A5" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#FCA5A5" }}>Da accantonare per le tasse</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: "#FCA5A5" }}>{formatCurrency(totalTax)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODALS ───────────────────────────────────────────────────────── */}

      {/* Modal: Nuova Fonte */}
      <Modal open={modal === "source"} onClose={() => setModal(null)} title="Nuova Fonte di Reddito">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Nome</label>
            <input value={sourceForm.name} onChange={(e) => setSourceForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="es. Stipendio, Prop Firm FTMO, Stripe..." className="input-dark" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
            style={{ background: "#162032", border: "1px solid #1E2D42" }}
            onClick={() => setSourceForm((f) => ({ ...f, isTaxed: !f.isTaxed }))}>
            <div className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${sourceForm.isTaxed ? "justify-end" : "justify-start"}`} style={{ background: sourceForm.isTaxed ? "#3B82F6" : "#1E2D42" }}>
              <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow transition-all" />
            </div>
            <span className="text-sm" style={{ color: "#CBD5E1" }}>Reddito tassato</span>
          </div>
          {sourceForm.isTaxed && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Aliquota fiscale (%)</label>
              <input type="number" min={0} max={100} value={sourceForm.taxRate}
                onChange={(e) => setSourceForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
                className="input-dark" />
              {sourceForm.taxRate > 0 && (
                <div className="mt-2 p-3 rounded-xl animate-fade-in" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-xs" style={{ color: "#CBD5E1" }}>Su <span className="font-semibold" style={{ color: "#F1F5F9" }}>€1.000</span> lordi:</p>
                  <p className="text-xs mt-0.5" style={{ color: "#FCA5A5" }}>Tasse: -{formatCurrency(1000 * sourceForm.taxRate / 100)}</p>
                  <p className="text-sm font-bold" style={{ color: "#6EE7B7" }}>Netto: {formatCurrency(1000 * (1 - sourceForm.taxRate / 100))}</p>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Colore</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button key={c} onClick={() => setSourceForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all duration-150"
                  style={{ background: c, boxShadow: sourceForm.color === c ? `0 0 0 2px #0F172A, 0 0 0 4px ${c}` : "none" }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Annulla</button>
            <button onClick={addSource} disabled={!sourceForm.name || loading} className="btn-primary flex-1">
              {loading ? "..." : "Salva Fonte"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Nuova Entrata */}
      <Modal open={modal === "entry"} onClose={() => setModal(null)} title="Nuova Entrata">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Fonte</label>
            {sources.length === 0 ? (
              <p className="text-sm p-3 rounded-xl" style={{ color: "#64748B", background: "#162032", border: "1px solid #1E2D42" }}>
                Prima crea una fonte di reddito nel tab Entrate.
              </p>
            ) : (
              <select value={entryForm.sourceId} onChange={(e) => setEntryForm((f) => ({ ...f, sourceId: e.target.value }))}
                className="input-dark cursor-pointer">
                <option value="">Seleziona fonte...</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.name} {s.isTaxed ? `(${s.taxRate}%)` : "(non tassato)"}</option>)}
              </select>
            )}
          </div>
          {/* Currency toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Valuta</label>
            <div className="flex gap-2">
              {(["EUR", "USD"] as const).map((cur) => (
                <button key={cur} type="button"
                  onClick={() => setEntryForm((f) => ({ ...f, currency: cur }))}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                  style={entryForm.currency === cur
                    ? { background: cur === "EUR" ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${cur === "EUR" ? "rgba(59,130,246,0.4)" : "rgba(16,185,129,0.4)"}`, color: cur === "EUR" ? "#93C5FD" : "#6EE7B7" }
                    : { background: "#162032", border: "1px solid #1E2D42", color: "#64748B" }}>
                  {cur === "EUR" ? "€ EUR" : "$ USD"}
                </button>
              ))}
            </div>
          </div>
          {/* Exchange rate if USD */}
          {entryForm.currency === "USD" && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Tasso EUR/USD</label>
              <input type="number" min={0} step="0.0001" value={entryForm.eurUsdRate}
                onChange={(e) => setEntryForm((f) => ({ ...f, eurUsdRate: e.target.value }))}
                placeholder="es. 1.08" className="input-dark" />
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>1 EUR = {entryForm.eurUsdRate || "?"} USD · es. tasso odierno da Google</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
              Importo lordo {entryForm.currency === "USD" ? "($)" : "(€)"}
            </label>
            <input type="number" min={0} value={entryForm.grossAmount}
              onChange={(e) => setEntryForm((f) => ({ ...f, grossAmount: e.target.value }))}
              placeholder="0.00" className="input-dark" />
            {previewRawG > 0 && previewSrc && (
              <div className="mt-2 p-3 rounded-xl animate-fade-in space-y-1" style={{ background: previewT > 0 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${previewT > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}` }}>
                {entryForm.currency === "USD" && previewRate > 0 && (
                  <p className="text-xs" style={{ color: "#93C5FD" }}>$ {previewRawG.toFixed(2)} ÷ {previewRate} = {formatCurrency(previewG)}</p>
                )}
                {entryForm.currency === "USD" && !previewRate && (
                  <p className="text-xs" style={{ color: "#F59E0B" }}>Inserisci il tasso EUR/USD per la conversione</p>
                )}
                {previewT > 0
                  ? <><p className="text-xs" style={{ color: "#FCA5A5" }}>Tasse ({previewSrc.taxRate}%): -{formatCurrency(previewT)}</p><p className="text-sm font-bold" style={{ color: "#6EE7B7" }}>Netto: {formatCurrency(previewN)}</p></>
                  : <p className="text-sm font-bold" style={{ color: "#6EE7B7" }}>Non tassato → netto {formatCurrency(previewG)}</p>
                }
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Data</label>
            <input type="date" value={entryForm.date} onChange={(e) => setEntryForm((f) => ({ ...f, date: e.target.value }))} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Descrizione (opzionale)</label>
            <input value={entryForm.description} onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="es. Payout FTMO, stipendio marzo..." className="input-dark" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Annulla</button>
            <button onClick={addEntry} disabled={!entryForm.sourceId || !entryForm.grossAmount || loading} className="btn-primary flex-1">
              {loading ? "..." : "Aggiungi"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Nuova Spesa */}
      <Modal open={modal === "expense"} onClose={() => setModal(null)} title="Nuova Spesa">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Categoria</label>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button key={cat.key} onClick={() => setExpenseForm((f) => ({ ...f, category: cat.key }))}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer"
                  style={expenseForm.category === cat.key
                    ? { background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }
                    : { background: "#162032", border: "1px solid #1E2D42", color: "#64748B" }}>
                  <cat.Icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Importo (€)</label>
            <input type="number" min={0} value={expenseForm.amount}
              onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Descrizione</label>
            <input value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="es. Affitto, spesa supermercato..." className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Data</label>
            <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} className="input-dark" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Annulla</button>
            <button onClick={addExpense} disabled={!expenseForm.amount || loading} className="btn-primary flex-1">
              {loading ? "..." : "Aggiungi"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
