import { UsersTable } from "@/components/module/admin";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage roles, access, and accounts across the platform.</p>
      </div>
      <UsersTable />
    </div>
  );
}