import type { ReactNode } from "react";

// Shared by admin, recruiter and candidate. It stays role-agnostic on
// purpose: each role layout wraps its pages in RoleGuard and DashboardShell,
// and RoleGuard sends anonymous visitors to /login.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}