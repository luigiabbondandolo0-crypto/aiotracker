import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const tx = await prisma.stockTransaction.create({
    data: {
      holdingId: params.id,
      type: body.type,
      date: new Date(body.date),
      units: parseFloat(body.units),
      price: parseFloat(body.price),
      fees: body.fees ? parseFloat(body.fees) : 0,
      total: parseFloat(body.total ?? body.units * body.price),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(tx);
}
