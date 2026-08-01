import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session) redirect("/login");
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });
  if (!user?.onboardingCompleted) redirect("/onboarding");

  return (
    <SidebarProvider>
      <div className="app-wrapper">
        <AppSidebar />
        <div className="app-body">
          <AppHeader />
          <main className="app-main">
            <div className="app-container">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
