import type { ReactNode } from "react";
import { redirect } from "next/navigation";

// TODO: replace with your real session helper (Better Auth server client).
// import { getServerSession } from "@/lib/auth-client";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // const session = await getServerSession();
  // if (!session?.user) redirect("/login");
  // if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        {/* TODO: nav — Dashboard, Users, Companies, Payments, Audit Logs */}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center px-6">
          {/* TODO: breadcrumb / page title / user menu */}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
