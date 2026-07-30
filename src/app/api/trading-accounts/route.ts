import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await prisma.tradingAccount.findMany({
    where: { userId: session.user.id },
    include: { trades: { orderBy: { openDate: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const account = await prisma.tradingAccount.create({
    data: {
      userId: session.user.id,
      brokerName: body.brokerName,
      accountName: body.accountName,
      currency: body.currency ?? "USD",
      balance: parseFloat(body.balance),
      initialDeposit: parseFloat(body.initialDeposit),
      assetClass: body.assetClass,
      notes: body.notes ?? null,
    },
    include: { trades: true },
  });
  return NextResponse.json(account);
}
