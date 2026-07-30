import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await prisma.eTFPlan.findMany({
    where: { userId: session.user.id },
    include: { contributions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const plan = await prisma.eTFPlan.create({
    data: {
      userId: session.user.id,
      name: body.name,
      ticker: body.ticker,
      isin: body.isin ?? null,
      broker: body.broker ?? null,
      frequency: body.frequency,
      amount: parseFloat(body.amount),
      startDate: new Date(body.startDate),
      currency: body.currency ?? "EUR",
      notes: body.notes ?? null,
    },
    include: { contributions: true },
  });
  return NextResponse.json(plan);
}
