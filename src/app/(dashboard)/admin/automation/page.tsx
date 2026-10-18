import { AutomationDashboard } from "@/components/module/admin";

export default function AdminAutomationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Automation</h1>
        <p className="text-sm text-muted-foreground">
          Events sent to the n8n workflows. Failed events can be retried from here.
        </p>
      </div>
      <AutomationDashboard />
    </div>
  );
}