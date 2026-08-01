import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.stockHolding.update({
    where: { id },
    data: {
      ticker: body.ticker,
      companyName: body.companyName ?? null,
      exchange: body.exchange ?? null,
      broker: body.broker ?? null,
      units: parseFloat(body.units),
      avgPrice: parseFloat(body.avgPrice),
      currentPrice: body.currentPrice ? parseFloat(body.currentPrice) : null,
      currency: body.currency,
      sector: body.sector ?? null,
      country: body.country ?? null,
      notes: body.notes ?? null,
    },
    include: { stockTransactions: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.stockHolding.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
