import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.tradingAccount.update({
    where: { id },
    data: {
      brokerName: body.brokerName,
      accountName: body.accountName,
      currency: body.currency,
      balance: parseFloat(body.balance),
      initialDeposit: parseFloat(body.initialDeposit),
      assetClass: body.assetClass,
      isActive: body.isActive ?? true,
      notes: body.notes ?? null,
    },
    include: { trades: { orderBy: { openDate: "desc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.tradingAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
