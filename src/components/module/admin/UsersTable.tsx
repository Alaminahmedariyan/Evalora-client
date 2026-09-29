"use client";

import { useState } from "react";
import { Trash2, Users } from "lucide-react";

import type { UserRole, UserStatus } from "@/types";
import { useDebounce, useDeleteUser, useGetMe, useUpdateUserRole, useUpdateUserStatus, useUsers } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

const ROLES: UserRole[] = ["ADMIN", "RECRUITER", "CANDIDATE"];
const STATUSES: UserStatus[] = ["ACTIVE", "PENDING", "SUSPENDED"];

const STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: "status-success",
  PENDING: "status-pending",
  SUSPENDED: "status-danger",
};

const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [status, setStatus] = useState<UserStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data: me } = useGetMe();
  const myId = me?.data.id;

  const { data, isPending, isError } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: role === "ALL" ? undefined : role,
    status: status === "ALL" ? undefined : status,
  });

  const roleMutation = useUpdateUserRole();
  const statusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  async function handleRoleChange(id: string, name: string, next: UserRole) {
    const extra = next === "RECRUITER" ? " They will still need to register a company before using recruiter features." : "";
    if (!window.confirm(`Change ${name}'s role to ${label(next)}?${extra}`)) return;
    try {
      await roleMutation.mutateAsync({ id, role: next });
      notify.success(`${name} is now ${label(next)}`);
    } catch (error) {
      notify.error("Couldn't change role", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleStatusChange(id: string, name: string, next: UserStatus) {
    if (next === "SUSPENDED" && !window.confirm(`Suspend ${name}? They will lose access until reactivated.`)) return;
    try {
      await statusMutation.mutateAsync({ id, status: next });
      notify.success(`${name} is now ${label(next)}`);
    } catch (error) {
      notify.error("Couldn't change status", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? Their account will be deactivated.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(`${name} deleted`);
    } catch (error) {
      notify.error("Couldn't delete user", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email or phone..."
          className="max-w-xs"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {label(r)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as UserStatus | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load users. Try refreshing the page.</div>
      ) : !data?.data.length ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => {
                  const isSelf = user.id === myId;
                  return (
                    <tr key={user.id} className="interactive border-b border-border last:border-0 hover:bg-accent/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={user.image ?? undefined} alt={user.name} />
                            <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {user.name}
                              {isSelf ? <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">You</span> : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={isSelf || roleMutation.isPending}
                          onChange={(e) => handleRoleChange(user.id, user.name, e.target.value as UserRole)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-60"
                          aria-label={`Role for ${user.name}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {label(r)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.status}
                          disabled={isSelf || statusMutation.isPending}
                          onChange={(e) => handleStatusChange(user.id, user.name, e.target.value as UserStatus)}
                          className={`h-8 rounded-md border px-2 text-xs font-medium disabled:opacity-60 ${STATUS_CLASS[user.status]}`}
                          aria-label={`Status for ${user.name}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {label(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={isSelf || deleteMutation.isPending}
                          onClick={() => handleDelete(user.id, user.name)}
                          className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination page={data.meta?.page ?? page} totalPages={data.meta?.totalPage ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}