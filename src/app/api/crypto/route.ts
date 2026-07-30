import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const holdings = await prisma.cryptoHolding.findMany({
    where: { userId: session.user.id },
    include: { cryptoTransactions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(holdings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const holding = await prisma.cryptoHolding.create({
    data: {
      userId: session.user.id,
      symbol: body.symbol,
      name: body.name ?? null,
      exchange: body.exchange ?? null,
      wallet: body.wallet ?? null,
      amount: parseFloat(body.amount),
      avgBuyPrice: parseFloat(body.avgBuyPrice),
      currentPrice: body.currentPrice ? parseFloat(body.currentPrice) : null,
      currency: body.currency ?? "USD",
      notes: body.notes ?? null,
    },
    include: { cryptoTransactions: true },
  });
  return NextResponse.json(holding);
}
