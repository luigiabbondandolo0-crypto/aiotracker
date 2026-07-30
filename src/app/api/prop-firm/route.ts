import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await prisma.propFirmAccount.findMany({
    where: { userId: session.user.id },
    include: { payouts: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const account = await prisma.propFirmAccount.create({
    data: {
      userId: session.user.id,
      firmName: body.firmName,
      accountSize: parseFloat(body.accountSize),
      accountType: body.accountType,
      status: body.status,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      currency: body.currency ?? "USD",
      balance: parseFloat(body.balance),
      equity: parseFloat(body.equity),
      profitTarget: body.profitTarget ? parseFloat(body.profitTarget) : null,
      maxDrawdown: body.maxDrawdown ? parseFloat(body.maxDrawdown) : null,
      currentDrawdown: body.currentDrawdown ? parseFloat(body.currentDrawdown) : null,
      notes: body.notes ?? null,
    },
    include: { payouts: true },
  });
  return NextResponse.json(account);
}
