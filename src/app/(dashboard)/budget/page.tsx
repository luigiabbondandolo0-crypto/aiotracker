"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IncomeSource {
  id: string;
  name: string;
  taxRate: number;
  isTaxed: boolean;
  color: string;
}

interface IncomeEntry {
  id: string;
  sourceId: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  taxRate: number;
  date: string;
  description?: string;
  source: IncomeSource;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

interface Allocation {
  category: string;
  percentage: number;
}

const CATEGORIES = [
  { key: "SPESE_NECESSARIE", label: "Spese Necessarie", icon: "🏠", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "SPESE_GIORNALIERE", label: "Spese Giornaliere", icon: "🛒", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "INVESTIMENTI", label: "Investimenti", icon: "📈", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "FONDO_EMERGENZA", label: "Fondo Emergenza", icon: "🛡️", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { key: "LIQUIDITA", label: "Liquidità", icon: "💧", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
];

const DEFAULT_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#f97316", "#ec4899", "#84cc16", "#6366f1",
];

const now = new Date();

// ─── Component ───────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [tab, setTab] = useState<"overview" | "entrate" | "spese" | "tasse" | "budget">("overview");
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
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // ── forms
  const [sourceForm, setSourceForm] = useState({ name: "", taxRate: 0, isTaxed: false, color: DEFAULT_COLORS[0] });
  const [entryForm, setEntryForm] = useState({ sourceId: "", grossAmount: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "SPESE_NECESSARIE", amount: "", description: "", date: new Date().toISOString().split("T")[0] });

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
  const totalGross = entries.reduce((s, e) => s + e.grossAmount, 0);
  const totalTax = entries.reduce((s, e) => s + e.taxAmount, 0);
  const totalNet = entries.reduce((s, e) => s + e.netAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const allocTotal = allocations.reduce((s, a) => s + a.percentage, 0);

  // ── Handlers
  async function addSource() {
    setLoading(true);
    await fetch("/api/income-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sourceForm),
    });
    setShowAddSource(false);
    setSourceForm({ name: "", taxRate: 0, isTaxed: false, color: DEFAULT_COLORS[0] });
    await fetchAll();
    setLoading(false);
  }

  async function addEntry() {
    setLoading(true);
    await fetch("/api/income-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entryForm),
    });
    setShowAddEntry(false);
    setEntryForm({ sourceId: "", grossAmount: "", date: new Date().toISOString().split("T")[0], description: "" });
    await fetchAll();
    setLoading(false);
  }

  async function addExpense() {
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseForm),
    });
    setShowAddExpense(false);
    setExpenseForm({ category: "SPESE_NECESSARIE", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
    await fetchAll();
    setLoading(false);
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/income-entries/${id}`, { method: "DELETE" });
    await fetchAll();
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    await fetchAll();
  }

  async function saveAllocations() {
    if (Math.round(allocTotal) !== 100) return;
    setLoading(true);
    await fetch("/api/budget-allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, allocations }),
    });
    setLoading(false);
  }

  const monthName = new Date(year, month - 1).toLocaleString("it-IT", { month: "long", year: "numeric" });

  // ── Preview tasse per nuovo entry
  const previewSource = sources.find((s) => s.id === entryForm.sourceId);
  const previewGross = Number(entryForm.grossAmount) || 0;
  const previewTax = previewSource?.isTaxed ? previewGross * (previewSource.taxRate / 100) : 0;
  const previewNet = previewGross - previewTax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget & Spese</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{monthName}</p>
        </div>
        {/* Month selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { const d = new Date(year, month - 2); setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#111827] border border-[#1e2a3a] text-slate-400 hover:text-white transition"
          >‹</button>
          <span className="text-slate-300 text-sm font-medium w-32 text-center capitalize">{monthName}</span>
          <button
            onClick={() => { const d = new Date(year, month); setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#111827] border border-[#1e2a3a] text-slate-400 hover:text-white transition"
          >›</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] border border-[#1e2a3a] rounded-xl p-1">
        {(["overview", "entrate", "spese", "budget", "tasse"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "overview" ? "📊 Overview" : t === "entrate" ? "💰 Entrate" : t === "spese" ? "🛒 Spese" : t === "budget" ? "📐 Budget" : "🧾 Tasse"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Entrate Lorde</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalGross)}</p>
            </div>
            <div className="bg-[#111827] border border-red-500/10 rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tasse</p>
              <p className="text-xl font-bold text-red-400">-{formatCurrency(totalTax)}</p>
            </div>
            <div className="bg-[#111827] border border-emerald-500/20 rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Netto Disponibile</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalNet)}</p>
            </div>
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Spese Totali</p>
              <p className={`text-xl font-bold ${totalExpenses > totalNet ? "text-red-400" : "text-orange-400"}`}>{formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          {/* Saldo */}
          <div className={`rounded-xl p-5 border ${totalNet - totalExpenses >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
            <p className="text-slate-400 text-sm mb-1">Saldo del mese</p>
            <p className={`text-3xl font-bold ${totalNet - totalExpenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(totalNet - totalExpenses)}
            </p>
            <p className="text-slate-500 text-xs mt-1">Netto {formatCurrency(totalNet)} − Spese {formatCurrency(totalExpenses)}</p>
          </div>

          {/* Allocazioni vs spese reali */}
          {allocations.some((a) => a.percentage > 0) && totalNet > 0 && (
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Allocazione Budget</h3>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const alloc = allocations.find((a) => a.category === cat.key);
                  const pct = alloc?.percentage ?? 0;
                  const allocated = totalNet * (pct / 100);
                  const spent = expenses.filter((e) => e.category === cat.key).reduce((s, e) => s + e.amount, 0);
                  const usedPct = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
                  return (
                    <div key={cat.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{cat.icon} {cat.label} <span className="text-slate-600">({pct}%)</span></span>
                        <span className="text-slate-400">{formatCurrency(spent)} / {formatCurrency(allocated)}</span>
                      </div>
                      <div className="bg-[#0b0f1a] rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${usedPct >= 100 ? "bg-red-500" : usedPct >= 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ENTRATE ── */}
      {tab === "entrate" && (
        <div className="space-y-4">
          {/* Fonti */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Fonti di Reddito</h3>
              <button onClick={() => setShowAddSource(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">+ Aggiungi Fonte</button>
            </div>
            {sources.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nessuna fonte. Aggiungine una.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.map((s) => (
                  <div key={s.id} className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-white text-sm font-medium">{s.name}</span>
                    </div>
                    {s.isTaxed ? (
                      <span className="text-xs text-red-400">Tassato {s.taxRate}%</span>
                    ) : (
                      <span className="text-xs text-emerald-400">Non tassato</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista entrate */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Entrate — <span className="capitalize">{monthName}</span></h3>
              <button onClick={() => setShowAddEntry(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">+ Aggiungi Entrata</button>
            </div>
            {entries.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nessuna entrata per questo mese.</p>
            ) : (
              <div className="space-y-2">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl p-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.source.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{e.source.name}</p>
                      {e.description && <p className="text-slate-500 text-xs">{e.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{formatCurrency(e.grossAmount)}</p>
                      {e.taxAmount > 0 && <p className="text-red-400 text-xs">-{formatCurrency(e.taxAmount)} tasse</p>}
                      {e.taxAmount > 0 && <p className="text-emerald-400 text-xs font-medium">{formatCurrency(e.netAmount)} netto</p>}
                    </div>
                    <button onClick={() => deleteEntry(e.id)} className="text-slate-600 hover:text-red-400 transition text-lg leading-none">×</button>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-[#1e2a3a]">
                  <span className="text-slate-400 text-sm">Totale</span>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatCurrency(totalGross)} lordo</p>
                    {totalTax > 0 && <p className="text-red-400 text-xs">-{formatCurrency(totalTax)} tasse</p>}
                    {totalTax > 0 && <p className="text-emerald-400 text-sm font-bold">{formatCurrency(totalNet)} netto</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SPESE ── */}
      {tab === "spese" && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Spese — <span className="capitalize">{monthName}</span></h3>
              <button onClick={() => setShowAddExpense(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">+ Aggiungi Spesa</button>
            </div>

            {/* Per categoria */}
            {CATEGORIES.map((cat) => {
              const catExpenses = expenses.filter((e) => e.category === cat.key);
              if (catExpenses.length === 0) return null;
              const catTotal = catExpenses.reduce((s, e) => s + e.amount, 0);
              return (
                <div key={cat.key} className="mb-4">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border mb-2 ${cat.bg} ${cat.color}`}>
                    {cat.icon} {cat.label} · {formatCurrency(catTotal)}
                  </div>
                  <div className="space-y-1.5">
                    {catExpenses.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 bg-[#0b0f1a] border border-[#1e2a3a] rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-white text-sm">{e.description || "—"}</p>
                          <p className="text-slate-500 text-xs">{new Date(e.date).toLocaleDateString("it-IT")}</p>
                        </div>
                        <span className="text-white font-medium text-sm">{formatCurrency(e.amount)}</span>
                        <button onClick={() => deleteExpense(e.id)} className="text-slate-600 hover:text-red-400 transition text-lg leading-none">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {expenses.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Nessuna spesa per questo mese.</p>
            )}

            {expenses.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-[#1e2a3a]">
                <span className="text-slate-400 text-sm">Totale spese</span>
                <span className="text-white font-bold">{formatCurrency(totalExpenses)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BUDGET ALLOCATION ── */}
      {tab === "budget" && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Allocazione Budget</h3>
            <p className="text-slate-500 text-xs mb-4">Scegli come distribuire il netto mensile ({formatCurrency(totalNet)})</p>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const alloc = allocations.find((a) => a.category === cat.key);
                const pct = alloc?.percentage ?? 0;
                const amount = totalNet * (pct / 100);
                return (
                  <div key={cat.key} className={`rounded-xl p-4 border ${cat.bg}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${cat.color}`}>{cat.icon} {cat.label}</span>
                      <span className="text-white font-bold text-sm">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={(e) => setAllocations((prev) => prev.map((a) => a.category === cat.key ? { ...a, percentage: Number(e.target.value) } : a))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className={`text-lg font-bold w-14 text-right ${cat.color}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totale */}
            <div className={`mt-4 flex justify-between items-center p-3 rounded-xl border ${Math.round(allocTotal) === 100 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <span className="text-sm font-medium text-slate-300">Totale allocato</span>
              <span className={`font-bold ${Math.round(allocTotal) === 100 ? "text-emerald-400" : "text-red-400"}`}>{allocTotal.toFixed(0)}%</span>
            </div>

            <button
              onClick={saveAllocations}
              disabled={Math.round(allocTotal) !== 100 || loading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-2.5 text-sm transition"
            >
              {loading ? "Salvataggio..." : "Salva Allocazione"}
            </button>
          </div>
        </div>
      )}

      {/* ── TASSE ── */}
      {tab === "tasse" && (
        <div className="space-y-4">
          {/* Sommario tasse */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Entrate Lorde</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalGross)}</p>
            </div>
            <div className="bg-[#111827] border border-red-500/20 rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tasse Da Pagare</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalTax)}</p>
              {totalGross > 0 && <p className="text-slate-500 text-xs mt-1">Aliquota media {((totalTax / totalGross) * 100).toFixed(1)}%</p>}
            </div>
            <div className="bg-[#111827] border border-emerald-500/20 rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Netto In Tasca</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalNet)}</p>
            </div>
          </div>

          {/* Dettaglio per fonte */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Dettaglio Tasse per Fonte</h3>
            {entries.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nessuna entrata per questo mese.</p>
            ) : (
              <div className="space-y-2">
                {entries.map((e) => (
                  <div key={e.id} className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: e.source.color }} />
                        <div>
                          <p className="text-white text-sm font-medium">{e.source.name}</p>
                          {e.description && <p className="text-slate-500 text-xs">{e.description}</p>}
                          <p className="text-slate-600 text-xs">{new Date(e.date).toLocaleDateString("it-IT")}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-white text-sm">Lordo: <span className="font-medium">{formatCurrency(e.grossAmount)}</span></p>
                        {e.taxAmount > 0 ? (
                          <>
                            <p className="text-red-400 text-xs">Tasse ({e.taxRate}%): -{formatCurrency(e.taxAmount)}</p>
                            <p className="text-emerald-400 text-sm font-bold">Netto: {formatCurrency(e.netAmount)}</p>
                          </>
                        ) : (
                          <p className="text-emerald-400 text-xs">Non tassato</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {totalTax > 0 && (
                  <div className="mt-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm font-medium">⚠️ Totale tasse da accantonare: <span className="text-red-300 font-bold">{formatCurrency(totalTax)}</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Aggiungi Fonte ── */}
      {showAddSource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Nuova Fonte di Reddito</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome</label>
                <input
                  value={sourceForm.name}
                  onChange={(e) => setSourceForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="es. Stipendio, Prop Firm FTMO..."
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isTaxed"
                  checked={sourceForm.isTaxed}
                  onChange={(e) => setSourceForm((f) => ({ ...f, isTaxed: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="isTaxed" className="text-sm text-slate-300">Reddito tassato</label>
              </div>
              {sourceForm.isTaxed && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Aliquota fiscale (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={sourceForm.taxRate}
                    onChange={(e) => setSourceForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
                    className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Su 1.000€ lordi → tasse {formatCurrency(1000 * sourceForm.taxRate / 100)} → netto {formatCurrency(1000 * (1 - sourceForm.taxRate / 100))}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Colore</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSourceForm((f) => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full transition ${sourceForm.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#111827]" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddSource(false)} className="flex-1 bg-[#0b0f1a] border border-[#1e2a3a] text-slate-400 rounded-xl py-2.5 text-sm hover:text-white transition">Annulla</button>
              <button onClick={addSource} disabled={!sourceForm.name || loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition">Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Aggiungi Entrata ── */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Nuova Entrata</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Fonte</label>
                <select
                  value={entryForm.sourceId}
                  onChange={(e) => setEntryForm((f) => ({ ...f, sourceId: e.target.value }))}
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Seleziona fonte...</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.isTaxed ? `(${s.taxRate}%)` : "(non tassato)"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Importo lordo (€)</label>
                <input
                  type="number"
                  min={0}
                  value={entryForm.grossAmount}
                  onChange={(e) => setEntryForm((f) => ({ ...f, grossAmount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
                {previewGross > 0 && previewSource && (
                  <div className="mt-1.5 text-xs space-y-0.5">
                    {previewTax > 0 ? (
                      <>
                        <p className="text-red-400">Tasse ({previewSource.taxRate}%): -{formatCurrency(previewTax)}</p>
                        <p className="text-emerald-400 font-medium">Netto: {formatCurrency(previewNet)}</p>
                      </>
                    ) : (
                      <p className="text-emerald-400">Non tassato → netto {formatCurrency(previewGross)}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data</label>
                <input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Descrizione (opzionale)</label>
                <input
                  value={entryForm.description}
                  onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="es. Payout FTMO marzo..."
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddEntry(false)} className="flex-1 bg-[#0b0f1a] border border-[#1e2a3a] text-slate-400 rounded-xl py-2.5 text-sm hover:text-white transition">Annulla</button>
              <button onClick={addEntry} disabled={!entryForm.sourceId || !entryForm.grossAmount || loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition">Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Aggiungi Spesa ── */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Nuova Spesa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setExpenseForm((f) => ({ ...f, category: cat.key }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition ${expenseForm.category === cat.key ? `${cat.bg} ${cat.color} border-opacity-100` : "bg-[#0b0f1a] border-[#1e2a3a] text-slate-400 hover:text-white"}`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Importo (€)</label>
                <input
                  type="number"
                  min={0}
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Descrizione</label>
                <input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="es. Affitto, spesa, abbonamento..."
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-[#0b0f1a] border border-[#1e2a3a] text-slate-400 rounded-xl py-2.5 text-sm hover:text-white transition">Annulla</button>
              <button onClick={addExpense} disabled={!expenseForm.amount || loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition">Aggiungi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
