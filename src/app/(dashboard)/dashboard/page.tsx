import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Trophy, TrendingUp, BarChart2, LineChart, Bitcoin, Wallet,
  TrendingDown, ArrowUpRight, Sparkles,
} from "lucide-react";

async function getDashboardData(userId: string) {
  const [propFirm, trading, etf, stocks, crypto, incomeEntries, expenses] =
    await Promise.all([
      prisma.propFirmAccount.findMany({ where: { userId, status: "ACTIVE" } }),
      prisma.tradingAccount.findMany({ where: { userId, isActive: true } }),
      prisma.eTFPlan.findMany({ where: { userId, isActive: true } }),
      prisma.stockHolding.findMany({ where: { userId } }),
      prisma.cryptoHolding.findMany({ where: { userId } }),
      prisma.incomeEntry.findMany({
        where: { userId, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      }),
      prisma.expense.findMany({
        where: { userId, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      }),
    ]);

  const propFirmTotal = propFirm.reduce((s: number, a) => s + a.equity, 0);
  const tradingTotal  = trading.reduce((s: number, a) => s + a.balance, 0);
  const etfTotal      = etf.reduce((s: number, a) => s + a.currentValue, 0);
  const stocksTotal   = stocks.reduce((s: number, h) => s + h.units * (h.currentPrice ?? h.avgPrice), 0);
  const cryptoTotal   = crypto.reduce((s: number, h) => s + h.amount * (h.currentPrice ?? h.avgBuyPrice), 0);
  const netWorth      = propFirmTotal + tradingTotal + etfTotal + stocksTotal + cryptoTotal;

  const monthlyNet      = incomeEntries.reduce((s: number, e) => s + e.netAmount, 0);
  const monthlyExpenses = expenses.reduce((s: number, e) => s + e.amount, 0);

  return {
    netWorth,
    breakdown: { propFirmTotal, tradingTotal, etfTotal, stocksTotal, cryptoTotal },
    monthlyNet,
    monthlyExpenses,
    counts: {
      propFirm: propFirm.length,
      trading: trading.length,
      etf: etf.length,
      stocks: stocks.length,
      crypto: crypto.length,
    },
  };
}

const BREAKDOWN = [
  { key: "propFirmTotal"  as const, label: "Prop Firm", color: "blue"   as const, icon: Trophy,    hex: "#3B82F6" },
  { key: "tradingTotal"   as const, label: "Trading",   color: "purple" as const, icon: TrendingUp, hex: "#7C3AED" },
  { key: "etfTotal"       as const, label: "ETF & PAC", color: "green"  as const, icon: BarChart2,  hex: "#10B981" },
  { key: "stocksTotal"    as const, label: "Azioni",    color: "yellow" as const, icon: LineChart,  hex: "#F59E0B" },
  { key: "cryptoTotal"    as const, label: "Crypto",    color: "red"    as const, icon: Bitcoin,    hex: "#EF4444" },
];

const STAT_ACCENT = {
  blue:   "#93C5FD",
  purple: "#C4B5FD",
  green:  "#6EE7B7",
  yellow: "#FCD34D",
  red:    "#FCA5A5",
};

export default async function DashboardPage() {
  const session  = await getServerSession(authOptions);
  const data     = await getDashboardData(session!.user.id);
  const monthName = new Date().toLocaleString("it-IT", { month: "long", year: "numeric" });
  const firstName = session?.user?.name?.split(" ")[0] ?? "Utente";
  const saldo     = data.monthlyNet - data.monthlyExpenses;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Greeting ───────────────────────────────────────────────────────── */}
      <div className="animate-fade-in flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="dot-live" />
            <span style={{ color: "#10B981", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Live</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Ciao, <span className="gradient-text-purple">{firstName}</span>
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "6px", textTransform: "capitalize" }}>
            {monthName}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "12px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
          <Sparkles size={13} style={{ color: "#C4B5FD" }} />
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#C4B5FD" }}>Portfolio Overview</span>
        </div>
      </div>

      {/* ── Net Worth Hero ─────────────────────────────────────────────────── */}
      <div
        className="animate-fade-in delay-100"
        style={{
          borderRadius: "20px",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1a0a3c 0%, #0f1729 40%, #071629 100%)",
          border: "1px solid rgba(124,58,237,0.2)",
          boxShadow: "0 0 60px rgba(109,40,217,0.08), 0 24px 48px rgba(0,0,0,0.4)",
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: "absolute", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", top: "-120px", right: "-80px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", bottom: "-60px", left: "40%", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#64748B", marginBottom: "10px" }}>
            Net Worth Totale
          </p>
          <p
            className="animate-count-up delay-200"
            style={{ fontSize: "46px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "16px" }}
          >
            {formatCurrency(data.netWorth)}
          </p>

          {/* Inline bar chart — asset allocation as thin bars */}
          <div style={{ display: "flex", gap: "3px", marginBottom: "16px", height: "4px", borderRadius: "99px", overflow: "hidden" }}>
            {BREAKDOWN.map((item) => {
              const pct = data.netWorth > 0 ? (data.breakdown[item.key] / data.netWorth) * 100 : 20;
              return (
                <div key={item.key} style={{ width: `${pct}%`, background: item.hex, flexShrink: 0, minWidth: pct > 0 ? "4px" : "0" }} />
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "11px", fontWeight: 600, color: "#6EE7B7" }}>
              <ArrowUpRight size={11} />
              {BREAKDOWN.filter(b => data.breakdown[b.key] > 0).length} classi di asset
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 500, color: "#64748B" }}>
              Saldo mese: {formatCurrency(saldo)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Prop Firm" value={formatCurrency(data.breakdown.propFirmTotal, "USD")}
          sub={`${data.counts.propFirm} account attivi`}
          accentColor="#93C5FD" delay={120} icon={<Trophy />} glowColor="blue"
        />
        <StatCard
          label="Trading" value={formatCurrency(data.breakdown.tradingTotal, "USD")}
          sub={`${data.counts.trading} broker personali`}
          accentColor="#C4B5FD" delay={160} icon={<TrendingUp />} glowColor="purple"
        />
        <StatCard
          label="ETF & PAC" value={formatCurrency(data.breakdown.etfTotal)}
          sub={`${data.counts.etf} piani accumulo`}
          accentColor="#6EE7B7" delay={200} icon={<BarChart2 />} glowColor="green"
        />
        <StatCard
          label="Azioni" value={formatCurrency(data.breakdown.stocksTotal, "USD")}
          sub={`${data.counts.stocks} holding`}
          accentColor="#FCD34D" delay={240} icon={<LineChart />} glowColor="yellow"
        />
        <StatCard
          label="Crypto" value={formatCurrency(data.breakdown.cryptoTotal, "USD")}
          sub={`${data.counts.crypto} coin`}
          accentColor="#FCA5A5" delay={280} icon={<Bitcoin />} glowColor="red"
        />
        <StatCard
          label="Budget Mese" value={formatCurrency(data.monthlyNet)}
          sub="Netto disponibile"
          accentColor="#6EE7B7" delay={320} icon={<Wallet />} glowColor="green"
        />
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in delay-400">

        {/* Asset Allocation — 2 cols */}
        <div className="card lg:col-span-2" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9", letterSpacing: "-0.01em" }}>Asset Allocation</p>
              <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Distribuzione del patrimonio</p>
            </div>
            <span className="badge badge-blue">{formatCurrency(data.netWorth)}</span>
          </div>
          <div className="space-y-4">
            {BREAKDOWN.map((item) => {
              const value = data.breakdown[item.key];
              const pct   = data.netWorth > 0 ? (value / data.netWorth) * 100 : 0;
              const Icon  = item.icon;
              const accent = STAT_ACCENT[item.color];
              return (
                <div key={item.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={12} style={{ color: accent }} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#CBD5E1" }}>{item.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>{formatCurrency(value)}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: accent, minWidth: "36px", textAlign: "right" }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <ProgressBar value={pct} color={item.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly summary */}
        <div className="space-y-3">
          {/* Netto */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B" }}>Netto Mese</p>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={14} style={{ color: "#6EE7B7" }} />
              </div>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#6EE7B7", letterSpacing: "-0.03em" }}>{formatCurrency(data.monthlyNet)}</p>
          </div>

          {/* Spese */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B" }}>Spese Mese</p>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingDown size={14} style={{ color: "#FCA5A5" }} />
              </div>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#FCA5A5", letterSpacing: "-0.03em" }}>{formatCurrency(data.monthlyExpenses)}</p>
          </div>

          {/* Saldo */}
          <div className="card" style={{ padding: "20px", background: saldo >= 0 ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)", borderColor: saldo >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B" }}>Saldo Netto</p>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: saldo >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${saldo >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart2 size={14} style={{ color: saldo >= 0 ? "#6EE7B7" : "#FCA5A5" }} />
              </div>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.03em", color: saldo >= 0 ? "#6EE7B7" : "#FCA5A5" }}>
              {formatCurrency(saldo)}
            </p>
            <p style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
              {saldo >= 0 ? "Risparmio mensile" : "Deficit mensile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
