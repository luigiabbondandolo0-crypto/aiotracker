import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIO Tracker — All-in-One Financial Tracker",
  description: "Track your finances, investments, trading accounts, and budget in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.className} h-full`}
    >
      <body className="min-h-full" style={{ background: "#111936", color: "#bdc8f0" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
