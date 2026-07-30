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

  const entries = await prisma.incomeEntry.findMany({
    where: {
      userId: session.user.id,
      ...(month && year ? { month: Number(month), year: Number(year) } : {}),
    },
    include: { source: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sourceId, grossAmount, date, description, notes } = await req.json();
  if (!sourceId || !grossAmount || !date) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const source = await prisma.incomeSource.findFirst({
    where: { id: sourceId, userId: session.user.id },
  });
  if (!source) return NextResponse.json({ error: "Fonte non trovata" }, { status: 404 });

  const gross = Number(grossAmount);
  const taxRate = source.isTaxed ? source.taxRate : 0;
  const taxAmount = gross * (taxRate / 100);
  const netAmount = gross - taxAmount;
  const d = new Date(date);

  const entry = await prisma.incomeEntry.create({
    data: {
      userId: session.user.id,
      sourceId,
      grossAmount: gross,
      taxAmount,
      netAmount,
      taxRate,
      date: d,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      description,
      notes,
    },
    include: { source: true },
  });

  return NextResponse.json(entry, { status: 201 });
}
