import type { ReactNode } from "react";

import RoleGuard from "@/components/module/auth/role-guard";
import { DashboardShell } from "@/components/dashboard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DashboardShell userRole="ADMIN">{children}</DashboardShell>
    </RoleGuard>
  );
}