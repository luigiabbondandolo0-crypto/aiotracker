import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sources = await prisma.incomeSource.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(sources);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, taxRate, isTaxed, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome obbligatorio" }, { status: 400 });

  const source = await prisma.incomeSource.create({
    data: {
      userId: session.user.id,
      name,
      taxRate: isTaxed ? Number(taxRate) : 0,
      isTaxed: Boolean(isTaxed),
      color: color || "#3b82f6",
    },
  });
  return NextResponse.json(source, { status: 201 });
}
