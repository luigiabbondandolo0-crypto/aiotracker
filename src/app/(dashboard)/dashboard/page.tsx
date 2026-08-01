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

const BREAKDOWN = [
  { key: "propFirmTotal"  as const, label: "Prop Firm", color: "blue"   as const },
  { key: "tradingTotal"   as const, label: "Trading",   color: "purple" as const },
  { key: "etfTotal"       as const, label: "ETF",       color: "green"  as const },
  { key: "stocksTotal"    as const, label: "Azioni",    color: "yellow" as const },
  { key: "cryptoTotal"    as const, label: "Crypto",    color: "red"    as const },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user.id);
  const monthName = new Date().toLocaleString("it-IT", { month: "long", year: "numeric" });
  const firstName = session?.user?.name?.split(" ")[0] ?? "Utente";
  const saldo = data.monthlyNet - data.monthlyExpenses;

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="dot-live" />
          <span className="text-xs font-medium" style={{ color: "#00e676" }}>Live</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#d7dcec" }}>
          Ciao, <span className="gradient-text-blue">{firstName}</span>
        </h1>
        <p className="text-sm capitalize mt-0.5" style={{ color: "#8492c4" }}>{monthName}</p>
      </div>

      {/* Net Worth Hero */}
      <div className="animate-fade-in delay-100 rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5e35b1 0%, #7c4dff 100%)" }}>
        <div className="absolute pointer-events-none" style={{ width: "210px", height: "210px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "-80px", right: "-60px" }} />
        <div className="absolute pointer-events-none" style={{ width: "210px", height: "210px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "20px", right: "60px" }} />
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 relative" style={{ color: "rgba(255,255,255,0.7)" }}>Net Worth Totale</p>
        <p className="text-4xl font-bold tracking-tight animate-count-up delay-200 relative" style={{ color: "white" }}>
          {formatCurrency(data.netWorth)}
        </p>
        <div className="flex items-center gap-2 mt-3 relative">
          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", borderColor: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
            <ArrowUpRight size={10} />
            Tutti gli asset
          </span>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Prop Firm" value={formatCurrency(data.breakdown.propFirmTotal, "USD")} sub="Account attivi" accentColor="#90caf9" delay={150} icon={<Trophy />} glowColor="blue" />
        <StatCard label="Trading" value={formatCurrency(data.breakdown.tradingTotal, "USD")} sub="Broker personali" accentColor="#b39ddb" delay={200} icon={<TrendingUp />} glowColor="purple" />
        <StatCard label="ETF & PAC" value={formatCurrency(data.breakdown.etfTotal)} sub="Piani accumulo" accentColor="#69f0ae" delay={250} icon={<BarChart2 />} glowColor="green" />
        <StatCard label="Azioni" value={formatCurrency(data.breakdown.stocksTotal, "USD")} sub="Portfolio azionario" accentColor="#ffe57f" delay={300} icon={<LineChart />} glowColor="yellow" />
        <StatCard label="Crypto" value={formatCurrency(data.breakdown.cryptoTotal, "USD")} sub="Holdings crypto" accentColor="#ef9a9a" delay={350} icon={<Bitcoin />} glowColor="red" />
        <StatCard label="Budget Mese" value={formatCurrency(data.monthlyNet)} sub="Netto disponibile" accentColor="#69f0ae" delay={400} icon={<Wallet />} glowColor="green" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in delay-400">

        {/* Asset Allocation — 2 cols */}
        <div className="card p-5 lg:col-span-2">
          <div className="card-header" style={{ padding: "0 0 16px", marginBottom: "16px", borderBottom: "1px solid #29314f" }}>
            <span className="text-sm font-semibold" style={{ color: "#d7dcec" }}>Asset Allocation</span>
            <span className="badge badge-blue">{formatCurrency(data.netWorth)}</span>
          </div>
          <div className="space-y-4">
            {BREAKDOWN.map((item) => {
              const value = data.breakdown[item.key];
              const pct = data.netWorth > 0 ? (value / data.netWorth) * 100 : 0;
              return (
                <div key={item.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium" style={{ color: "#bdc8f0" }}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "#8492c4" }}>{formatCurrency(value)}</span>
                      <span className="text-xs font-semibold" style={{ color: "#90caf9" }}>{pct.toFixed(1)}%</span>
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
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} style={{ color: "#69f0ae" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>Netto Mese</p>
            </div>
            <p className="text-xl font-bold" style={{ color: "#69f0ae" }}>{formatCurrency(data.monthlyNet)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} style={{ color: "#ef9a9a" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>Spese Mese</p>
            </div>
            <p className="text-xl font-bold" style={{ color: "#ef9a9a" }}>{formatCurrency(data.monthlyExpenses)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={14} style={{ color: "#90caf9" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8492c4" }}>Saldo</p>
            </div>
            <p className="text-xl font-bold" style={{ color: saldo >= 0 ? "#69f0ae" : "#ef9a9a" }}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
