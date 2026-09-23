import type { ReactNode } from "react";
import { redirect } from "next/navigation";

// Shared by admin/recruiter/candidate: only checks that *some* session
// exists. Role-specific checks (ADMIN vs RECRUITER vs CANDIDATE) live one
// level down in (dashboard)/admin/layout.tsx, (dashboard)/recruiter/layout.tsx,
// (dashboard)/candidate/layout.tsx — keep this layout role-agnostic.
//
// TODO: replace with your real session helper (Better Auth server client).
// import { getServerSession } from "@/lib/auth-client";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // const session = await getServerSession();
  // if (!session?.user) redirect("/login");

  return <>{children}</>;
}
