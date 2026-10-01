import type { ReactNode } from "react";

import RoleGuard from "@/components/module/auth/role-guard";
import { DashboardShell } from "@/components/dashboard";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CANDIDATE"]}>
      <DashboardShell userRole="CANDIDATE">{children}</DashboardShell>
    </RoleGuard>
  );
}