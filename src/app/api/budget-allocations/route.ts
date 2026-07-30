import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const allocations = await prisma.budgetAllocation.findMany({
    where: { userId: session.user.id, month, year },
  });
  return NextResponse.json(allocations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { month, year, allocations } = await req.json();
  // allocations: [{ category, percentage }]

  const total = allocations.reduce((s: number, a: { percentage: number }) => s + a.percentage, 0);
  if (Math.round(total) !== 100) {
    return NextResponse.json({ error: "Le percentuali devono sommare a 100%" }, { status: 400 });
  }

  // Upsert ogni categoria
  const ops = allocations.map((a: { category: string; percentage: number }) =>
    prisma.budgetAllocation.upsert({
      where: {
        userId_month_year_category: {
          userId: session.user.id,
          month: Number(month),
          year: Number(year),
          category: a.category as never,
        },
      },
      update: { percentage: a.percentage },
      create: {
        userId: session.user.id,
        month: Number(month),
        year: Number(year),
        category: a.category as never,
        percentage: a.percentage,
      },
    })
  );

  const result = await prisma.$transaction(ops);
  return NextResponse.json(result);
}
