"use client";

import { Building2, ClipboardList, Code2, ListChecks, Users, Wallet } from "lucide-react";

import { useDashboardStats } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { BreakdownBadges } from "./BreakdoenBadges";

const SKELETON_KEYS = ["sk-users", "sk-companies", "sk-problems", "sk-assessments", "sk-attempts", "sk-revenue"];

function formatCurrency(amountMinor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountMinor / 100);
}

export function DashboardStats() {
  const { data, isPending, isError } = useDashboardStats();

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <Card key={key}>
            <CardContent className="flex flex-col gap-4 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load dashboard stats. Try refreshing the page.
      </div>
    );
  }

  const stats = data.data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total users" value={stats.users.total} icon={Users} accent="primary">
        <BreakdownBadges data={stats.users.byRole} />
      </StatCard>

      <StatCard label="Companies" value={stats.companies.total} icon={Building2} accent="primary">
        <p className="text-xs text-muted-foreground">{stats.companies.verified} verified</p>
      </StatCard>

      <StatCard label="Problems" value={stats.problems.total} icon={Code2} accent="primary" />

      <StatCard label="Assessments" value={stats.assessments.total} icon={ClipboardList} accent="primary">
        <BreakdownBadges data={stats.assessments.byStatus} useStatusColors />
      </StatCard>

      <StatCard label="Attempts" value={stats.attempts.total} icon={ListChecks} accent="primary">
        <BreakdownBadges data={stats.attempts.byStatus} useStatusColors />
      </StatCard>

      <StatCard label="Revenue (paid)" value={formatCurrency(stats.payments.totalRevenueMinor)} icon={Wallet} accent="success">
        <p className="text-xs text-muted-foreground">{stats.payments.totalPaid} successful payments</p>
      </StatCard>
    </div>
  );
}