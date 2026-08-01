import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const PASSWORD_REGEX = {
  length: (pw: string) => pw.length >= 8,
  uppercase: (pw: string) => /[A-Z]/.test(pw),
  number: (pw: string) => /[0-9]/.test(pw),
  symbol: (pw: string) => /[^A-Za-z0-9]/.test(pw),
};

function isStrongPassword(pw: string) {
  return Object.values(PASSWORD_REGEX).every((fn) => fn(pw));
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: "Password non sicura: minimo 8 caratteri, una maiuscola, un numero, un simbolo" },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Link scaduto o non valido. Richiedi un nuovo reset." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
