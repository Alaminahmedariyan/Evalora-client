import type { ReactNode } from "react";

// TODO: replace with your real session helper (Better Auth server client).
// import { getServerSession } from "@/lib/auth-client";

export default async function CandidateLayout({ children }: { children: ReactNode }) {
  // const session = await getServerSession();
  // if (!session?.user) redirect("/login");
  // if (session.user.role !== "CANDIDATE") redirect("/");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        {/* TODO: nav — Dashboard, Profile, Invitations, Results, Notifications */}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center px-6">
          {/* TODO: breadcrumb / page title / notification bell / user menu */}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
