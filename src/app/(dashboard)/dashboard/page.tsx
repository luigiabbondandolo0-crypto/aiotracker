import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Trophy, TrendingUp, BarChart2, LineChart, Bitcoin, Wallet,
  TrendingDown, ArrowUpRight,
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
  const tradingTotal = trading.reduce((s: number, a) => s + a.balance, 0);
  const etfTotal = etf.reduce((s: number, a) => s + a.currentValue, 0);
  const stocksTotal = stocks.reduce((s: number, h) => s + h.units * (h.currentPrice ?? h.avgPrice), 0);
  const cryptoTotal = crypto.reduce((s: number, h) => s + h.amount * (h.currentPrice ?? h.avgBuyPrice), 0);
  const netWorth = propFirmTotal + tradingTotal + etfTotal + stocksTotal + cryptoTotal;

  const monthlyNet = incomeEntries.reduce((s: number, e) => s + e.netAmount, 0);
  const monthlyExpenses = expenses.reduce((s: number, e) => s + e.amount, 0);

  return { netWorth, breakdown: { propFirmTotal, tradingTotal, etfTotal, stocksTotal, cryptoTotal }, monthlyNet, monthlyExpenses };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user.id);
  const monthName = new Date().toLocaleString("it-IT", { month: "long", year: "numeric" });
  const firstName = session?.user?.name?.split(" ")[0] ?? "Utente";

  const breakdown = [
    { label: "Prop Firm", value: data.breakdown.propFirmTotal, color: "blue" as const, pct: data.netWorth > 0 ? (data.breakdown.propFirmTotal / data.netWorth) * 100 : 0 },
    { label: "Trading", value: data.breakdown.tradingTotal, color: "purple" as const, pct: data.netWorth > 0 ? (data.breakdown.tradingTotal / data.netWorth) * 100 : 0 },
    { label: "ETF", value: data.breakdown.etfTotal, color: "green" as const, pct: data.netWorth > 0 ? (data.breakdown.etfTotal / data.netWorth) * 100 : 0 },
    { label: "Azioni", value: data.breakdown.stocksTotal, color: "yellow" as const, pct: data.netWorth > 0 ? (data.breakdown.stocksTotal / data.netWorth) * 100 : 0 },
    { label: "Crypto", value: data.breakdown.cryptoTotal, color: "red" as const, pct: data.netWorth > 0 ? (data.breakdown.cryptoTotal / data.netWorth) * 100 : 0 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="dot-live" />
          <span className="text-xs font-medium" style={{ color: "#10b981" }}>Live</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Ciao, <span className="gradient-text-blue">{firstName}</span>
        </h1>
        <p className="text-sm capitalize mt-0.5" style={{ color: "#475569" }}>{monthName}</p>
      </div>

      {/* Net Worth Hero */}
      <div className="animate-fade-in delay-100 rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 100%)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05), transparent)", transform: "translate(30%, -30%)" }} />
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#334155" }}>Net Worth Totale</p>
        <p className="text-4xl font-bold tracking-tight text-white animate-count-up delay-200">
          {formatCurrency(data.netWorth)}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="badge badge-blue">
            <ArrowUpRight size={10} />
            Tutti gli asset
          </span>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Prop Firm" value={formatCurrency(data.breakdown.propFirmTotal, "USD")} sub="Account attivi" accentColor="#60a5fa" delay={150} icon={<Trophy />} glowColor="blue" />
        <StatCard label="Trading" value={formatCurrency(data.breakdown.tradingTotal, "USD")} sub="Broker personali" accentColor="#a78bfa" delay={200} icon={<TrendingUp />} glowColor="purple" />
        <StatCard label="ETF & PAC" value={formatCurrency(data.breakdown.etfTotal)} sub="Piani accumulo" accentColor="#34d399" delay={250} icon={<BarChart2 />} glowColor="green" />
        <StatCard label="Azioni" value={formatCurrency(data.breakdown.stocksTotal, "USD")} sub="Portfolio azionario" accentColor="#fbbf24" delay={300} icon={<LineChart />} glowColor="yellow" />
        <StatCard label="Crypto" value={formatCurrency(data.breakdown.cryptoTotal, "USD")} sub="Holdings crypto" accentColor="#f87171" delay={350} icon={<Bitcoin />} glowColor="red" />
        <StatCard label="Budget Mese" value={formatCurrency(data.monthlyNet)} sub="Netto disponibile" accentColor="#34d399" delay={400} icon={<Wallet />} glowColor="green" />
      </div>

      {/* Asset Allocation */}
      <div className="card p-5 animate-fade-in delay-400">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Asset Allocation</h2>
          <span className="badge badge-blue">{formatCurrency(data.netWorth)}</span>
        </div>
        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#475569" }}>{formatCurrency(item.value)}</span>
                  <span className="text-xs font-semibold" style={{ color: "#60a5fa" }}>{item.pct.toFixed(1)}%</span>
                </div>
              </div>
              <ProgressBar value={item.pct} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Mese overview */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in delay-500">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>Netto Mese</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(data.monthlyNet)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red-400" />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>Spese Mese</p>
          </div>
          <p className="text-xl font-bold text-red-400">{formatCurrency(data.monthlyExpenses)}</p>
        </div>
      </div>
    </div>
  );
}
