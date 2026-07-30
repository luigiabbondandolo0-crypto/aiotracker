import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const trade = await prisma.trade.create({
    data: {
      accountId: params.id,
      symbol: body.symbol,
      direction: body.direction,
      openDate: new Date(body.openDate),
      closeDate: body.closeDate ? new Date(body.closeDate) : null,
      openPrice: parseFloat(body.openPrice),
      closePrice: body.closePrice ? parseFloat(body.closePrice) : null,
      size: parseFloat(body.size),
      pnl: body.pnl !== undefined && body.pnl !== "" ? parseFloat(body.pnl) : null,
      pnlPct: body.pnlPct !== undefined && body.pnlPct !== "" ? parseFloat(body.pnlPct) : null,
      fees: body.fees ? parseFloat(body.fees) : 0,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(trade);
}

export async function DELETE(req: Request, { params: _ }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tradeId } = await req.json();
  await prisma.trade.delete({ where: { id: tradeId } });
  return NextResponse.json({ ok: true });
}
