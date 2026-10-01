import { AuditLogsTable } from "@/components/module/admin";

export default function AdminAuditLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">A record of sensitive actions across the platform.</p>
      </div>
      <AuditLogsTable />
    </div>
  );
}