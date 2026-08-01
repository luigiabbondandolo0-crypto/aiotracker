import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.propFirmAccount.update({
    where: { id },
    data: {
      firmName: body.firmName,
      accountSize: parseFloat(body.accountSize),
      accountType: body.accountType,
      status: body.status,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      currency: body.currency,
      balance: parseFloat(body.balance),
      equity: parseFloat(body.equity),
      profitTarget: body.profitTarget ? parseFloat(body.profitTarget) : null,
      maxDrawdown: body.maxDrawdown ? parseFloat(body.maxDrawdown) : null,
      currentDrawdown: body.currentDrawdown ? parseFloat(body.currentDrawdown) : null,
      notes: body.notes ?? null,
    },
    include: { payouts: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.propFirmAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
