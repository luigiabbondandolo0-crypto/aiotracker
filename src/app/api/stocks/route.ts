import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const holdings = await prisma.stockHolding.findMany({
    where: { userId: session.user.id },
    include: { stockTransactions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(holdings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const holding = await prisma.stockHolding.create({
    data: {
      userId: session.user.id,
      ticker: body.ticker,
      companyName: body.companyName ?? null,
      exchange: body.exchange ?? null,
      broker: body.broker ?? null,
      units: parseFloat(body.units),
      avgPrice: parseFloat(body.avgPrice),
      currentPrice: body.currentPrice ? parseFloat(body.currentPrice) : null,
      currency: body.currency ?? "USD",
      sector: body.sector ?? null,
      country: body.country ?? null,
      notes: body.notes ?? null,
    },
    include: { stockTransactions: true },
  });
  return NextResponse.json(holding);
}
