import { DashboardStats } from "@/components/module/admin/DashboardStats";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview across all companies.</p>
      </div>
      <DashboardStats />
    </div>
  );
}