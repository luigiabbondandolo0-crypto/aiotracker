import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const tx = await prisma.cryptoTransaction.create({
    data: {
      holdingId: id,
      type: body.type,
      date: new Date(body.date),
      amount: parseFloat(body.amount),
      price: parseFloat(body.price),
      fees: body.fees ? parseFloat(body.fees) : 0,
      total: parseFloat(body.total ?? body.amount * body.price),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(tx);
}
