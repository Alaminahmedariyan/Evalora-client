import { CompaniesTable } from "@/components/module/admin";

export default function AdminCompaniesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">Review and verify companies registered on the platform.</p>
      </div>
      <CompaniesTable />
    </div>
  );
}