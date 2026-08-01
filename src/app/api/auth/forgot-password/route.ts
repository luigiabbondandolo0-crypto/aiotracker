import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: true });

    // Invalidate old tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Log for now — plug in email provider here
    console.log(`[PASSWORD RESET] ${email} → ${resetUrl}`);

    // TODO: send email via nodemailer/resend/sendgrid
    // await sendEmail({ to: email, subject: "Reset password AIO Tracker", html: `<a href="${resetUrl}">Reset password</a>` });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
