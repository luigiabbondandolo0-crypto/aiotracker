import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });

    // Always return success — prevents email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: true });

    // Invalidate old tokens
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({ data: { email, token, expires } });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "AIO Tracker <noreply@aiotracker.app>",
      to: email,
      subject: "Reimposta la tua password — AIO Tracker",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#111936;font-family:Inter,system-ui,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#1a223f;border:1px solid #29314f;border-radius:16px;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding:32px 40px 24px;border-bottom:1px solid #29314f;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#5e35b1,#7c4dff);
                          border-radius:12px;width:44px;height:44px;text-align:center;
                          vertical-align:middle;">
                          <span style="font-size:20px;">⚡</span>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="font-size:18px;font-weight:700;color:#d7dcec;">AIO Tracker</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px;">
                    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#d7dcec;">
                      Reimposta la tua password
                    </h1>
                    <p style="margin:0 0 24px;font-size:14px;color:#8492c4;line-height:1.6;">
                      Hai richiesto il reset della password per il tuo account AIO Tracker
                      (<strong style="color:#90caf9;">${email}</strong>).<br>
                      Clicca il pulsante qui sotto per scegliere una nuova password.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:10px;
                          background:linear-gradient(135deg,#5e35b1,#7c4dff);">
                          <a href="${resetUrl}"
                            style="display:inline-block;padding:14px 32px;font-size:14px;
                              font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                            Reimposta Password →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:12px;color:#4a5280;line-height:1.6;">
                      Il link scade tra <strong style="color:#8492c4;">1 ora</strong>.<br>
                      Se non hai richiesto il reset, ignora questa email — il tuo account è al sicuro.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #29314f;">
                    <p style="margin:0;font-size:11px;color:#4a5280;">
                      AIO Tracker · Il tuo workspace finanziario
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[FORGOT PASSWORD]", err);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
