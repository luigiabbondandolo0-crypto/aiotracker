import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const [propFirm, trading, etf, stocks, crypto, transactions, budgets] =
    await Promise.all([
      prisma.propFirmAccount.findMany({ where: { userId, status: "ACTIVE" } }),
      prisma.tradingAccount.findMany({ where: { userId, isActive: true } }),
      prisma.eTFPlan.findMany({ where: { userId, isActive: true } }),
      prisma.stockHolding.findMany({ where: { userId } }),
      prisma.cryptoHolding.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.budget.findMany({
        where: { userId, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      }),
    ]);

  const propFirmTotal = propFirm.reduce((s, a) => s + a.equity, 0);
  const tradingTotal = trading.reduce((s, a) => s + a.balance, 0);
  const etfTotal = etf.reduce((s, a) => s + a.currentValue, 0);
  const stocksTotal = stocks.reduce(
    (s, h) => s + h.units * (h.currentPrice ?? h.avgPrice),
    0
  );
  const cryptoTotal = crypto.reduce(
    (s, h) => s + h.amount * (h.currentPrice ?? h.avgBuyPrice),
    0
  );

  const netWorth = propFirmTotal + tradingTotal + etfTotal + stocksTotal + cryptoTotal;

  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);

  return {
    netWorth,
    breakdown: { propFirmTotal, tradingTotal, etfTotal, stocksTotal, cryptoTotal },
    monthlyIncome,
    monthlyExpenses,
    totalBudget,
    budgetUsedPct: totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user.id);

  const stats = [
    {
      label: "Net Worth",
      value: formatCurrency(data.netWorth, "EUR"),
      sub: "Patrimonio totale",
      color: "text-white",
    },
    {
      label: "Prop Firm",
      value: formatCurrency(data.breakdown.propFirmTotal, "USD"),
      sub: "Account attivi",
      color: "text-blue-400",
    },
    {
      label: "Trading",
      value: formatCurrency(data.breakdown.tradingTotal, "USD"),
      sub: "Account personali",
      color: "text-purple-400",
    },
    {
      label: "ETF",
      value: formatCurrency(data.breakdown.etfTotal, "EUR"),
      sub: "Piani PAC",
      color: "text-emerald-400",
    },
    {
      label: "Azioni",
      value: formatCurrency(data.breakdown.stocksTotal, "USD"),
      sub: "Portfolio azionario",
      color: "text-yellow-400",
    },
    {
      label: "Crypto",
      value: formatCurrency(data.breakdown.cryptoTotal, "USD"),
      sub: "Portfolio crypto",
      color: "text-orange-400",
    },
  ];

  const now = new Date();
  const monthName = now.toLocaleString("it-IT", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Panoramica finanziaria — {monthName}</p>
      </div>

      {/* Net Worth Hero */}
      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/5 border border-blue-500/20 rounded-2xl p-6">
        <p className="text-slate-400 text-sm font-medium mb-1">Net Worth Totale</p>
        <p className="text-4xl font-bold text-white">{formatCurrency(data.netWorth, "EUR")}</p>
        <p className="text-slate-500 text-sm mt-2">Somma di tutti gli asset tracciati</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.slice(1).map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4"
          >
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-600 text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Mese corrente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Entrate Mese
          </p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(data.monthlyIncome)}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Uscite Mese
          </p>
          <p className="text-xl font-bold text-red-400">
            {formatCurrency(data.monthlyExpenses)}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            Budget Usato
          </p>
          <p
            className={`text-xl font-bold ${
              data.budgetUsedPct > 90
                ? "text-red-400"
                : data.budgetUsedPct > 70
                ? "text-yellow-400"
                : "text-emerald-400"
            }`}
          >
            {data.budgetUsedPct.toFixed(0)}%
          </p>
          <div className="mt-2 bg-[#0b0f1a] rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                data.budgetUsedPct > 90
                  ? "bg-red-500"
                  : data.budgetUsedPct > 70
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(data.budgetUsedPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Asset Allocation</h2>
        <div className="space-y-3">
          {[
            { label: "Prop Firm", value: data.breakdown.propFirmTotal, color: "bg-blue-500" },
            { label: "Trading", value: data.breakdown.tradingTotal, color: "bg-purple-500" },
            { label: "ETF", value: data.breakdown.etfTotal, color: "bg-emerald-500" },
            { label: "Azioni", value: data.breakdown.stocksTotal, color: "bg-yellow-500" },
            { label: "Crypto", value: data.breakdown.cryptoTotal, color: "bg-orange-500" },
          ].map((item) => {
            const pct = data.netWorth > 0 ? (item.value / data.netWorth) * 100 : 0;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-24">{item.label}</span>
                <div className="flex-1 bg-[#0b0f1a] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-10 text-right">
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
