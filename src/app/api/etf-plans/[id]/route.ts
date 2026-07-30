import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = await prisma.eTFPlan.update({
    where: { id: params.id },
    data: {
      name: body.name,
      ticker: body.ticker,
      isin: body.isin ?? null,
      broker: body.broker ?? null,
      frequency: body.frequency,
      amount: parseFloat(body.amount),
      startDate: new Date(body.startDate),
      currency: body.currency,
      currentValue: body.currentValue ? parseFloat(body.currentValue) : undefined,
      isActive: body.isActive ?? true,
      notes: body.notes ?? null,
    },
    include: { contributions: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.eTFPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
