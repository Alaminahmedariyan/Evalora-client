import type { ReactNode } from "react";

import RoleGuard from "@/components/module/auth/role-guard";
import { DashboardShell } from "@/components/dashboard";

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["RECRUITER"]}>
      <DashboardShell userRole="RECRUITER">{children}</DashboardShell>
    </RoleGuard>
  );
}