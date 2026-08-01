import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const amount = parseFloat(body.amount);
  const units = parseFloat(body.units);

  const contribution = await prisma.eTFContribution.create({
    data: {
      planId: id,
      date: new Date(body.date),
      amount,
      units,
      price: parseFloat(body.price),
      fees: body.fees ? parseFloat(body.fees) : 0,
      notes: body.notes ?? null,
    },
  });

  // Update plan totals
  const plan = await prisma.eTFPlan.findUnique({ where: { id } });
  if (plan) {
    const newTotalInvested = plan.totalInvested + amount;
    const newUnits = plan.units + units;
    const newAvgPrice = newUnits > 0 ? newTotalInvested / newUnits : 0;
    await prisma.eTFPlan.update({
      where: { id },
      data: {
        totalInvested: newTotalInvested,
        units: newUnits,
        avgPrice: newAvgPrice,
      },
    });
  }

  return NextResponse.json(contribution);
}
