import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      ...(month && year ? { month: Number(month), year: Number(year) } : {}),
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, amount, description, date, notes } = await req.json();
  if (!category || !amount || !date) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const d = new Date(date);
  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      category,
      amount: Number(amount),
      description,
      date: d,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      notes,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
