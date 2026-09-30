import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "brand" | "success" | "warning" | "danger";
  children?: React.ReactNode;
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  brand: "bg-brand-accent/10 text-brand-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function StatCard({ label, value, icon: Icon, accent = "primary", children }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={cn("flex size-9 items-center justify-center rounded-lg", accentClasses[accent])}>
            <Icon className="size-4.5" aria-hidden="true" />
          </div>
        </div>
        <p className="stat-number text-3xl font-semibold">{value}</p>
        {children}
      </CardContent>
    </Card>
  );
}