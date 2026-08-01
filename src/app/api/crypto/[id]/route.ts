import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.cryptoHolding.update({
    where: { id },
    data: {
      symbol: body.symbol,
      name: body.name ?? null,
      exchange: body.exchange ?? null,
      wallet: body.wallet ?? null,
      amount: parseFloat(body.amount),
      avgBuyPrice: parseFloat(body.avgBuyPrice),
      currentPrice: body.currentPrice ? parseFloat(body.currentPrice) : null,
      currency: body.currency,
      notes: body.notes ?? null,
    },
    include: { cryptoTransactions: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.cryptoHolding.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
