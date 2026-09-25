import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Mail,
  ScrollText,
  UserCircle,
  Users,
} from "lucide-react";

import type { UserRole } from "@/types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navByRole: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Companies", href: "/admin/companies", icon: Building2 },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  ],
  RECRUITER: [
    { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
    { label: "Company", href: "/recruiter/company", icon: Building2 },
    { label: "Problems", href: "/recruiter/problems", icon: FileText },
    { label: "Assessments", href: "/recruiter/assessments", icon: ClipboardList },
    { label: "Evaluations", href: "/recruiter/evaluations", icon: ListChecks },
    { label: "Subscription", href: "/recruiter/subscription", icon: Gauge },
    { label: "Payments", href: "/recruiter/payments", icon: CreditCard },
  ],
  CANDIDATE: [
    { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
    { label: "Profile", href: "/candidate/profile", icon: UserCircle },
    { label: "Invitations", href: "/candidate/invitations", icon: Mail },
    { label: "Results", href: "/candidate/results", icon: BarChart3 },
    { label: "Notifications", href: "/candidate/notifications", icon: Bell },
  ],
};

export const roleLabel: Record<UserRole, string> = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  CANDIDATE: "Candidate",
};