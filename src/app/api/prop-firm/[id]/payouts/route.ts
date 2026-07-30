import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const amount = parseFloat(body.amount);

  const [payout] = await prisma.$transaction([
    prisma.propPayout.create({
      data: {
        accountId: params.id,
        amount,
        date: new Date(body.date),
        status: body.status ?? "PENDING",
        notes: body.notes ?? null,
      },
    }),
    prisma.propFirmAccount.update({
      where: { id: params.id },
      data: { totalPayout: { increment: amount } },
    }),
  ]);

  return NextResponse.json(payout);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { payoutId } = await req.json();
  const payout = await prisma.propPayout.findUnique({ where: { id: payoutId } });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.propPayout.delete({ where: { id: payoutId } }),
    prisma.propFirmAccount.update({
      where: { id: params.id },
      data: { totalPayout: { decrement: payout.amount } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
