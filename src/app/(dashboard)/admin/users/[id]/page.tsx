"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarClock, Mail, Phone, Trash2 } from "lucide-react";

import type { UserRole, UserStatus } from "@/types";
import { useGetMe } from "@/hooks";
import { useDeleteUser, useUpdateUserRole, useUpdateUserStatus, useUser } from "@/hooks/user.hook";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const ROLES: UserRole[] = ["ADMIN", "RECRUITER", "CANDIDATE"];
const STATUSES: UserStatus[] = ["ACTIVE", "PENDING", "SUSPENDED"];

const STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: "status-success",
  PENDING: "status-pending",
  SUSPENDED: "status-danger",
};

const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

function formatDateTime(value: string | null) {
  if (!value) return "Never";

  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isPending, isError } = useUser(id);
  const { data: me } = useGetMe();

  const roleMutation = useUpdateUserRole();
  const statusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pendingStatus, setPendingStatus] = useState<UserStatus | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const user = data.data;
  const isSelf = me?.data.id === user.id;

  async function applyRole(next: UserRole) {
    try {
      await roleMutation.mutateAsync({ id: user.id, role: next });
      notify.success(`${user.name} is now ${label(next)}`);
    } catch (error) {
      notify.error("Couldn't change role", isApiError(error) ? error.message : undefined);
    }
  }

  async function applyStatus(next: UserStatus) {
    try {
      await statusMutation.mutateAsync({ id: user.id, status: next });
      notify.success(`${user.name} is now ${label(next)}`);
    } catch (error) {
      notify.error("Couldn't change status", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(user.id);
      notify.success(`${user.name} deleted`);
      router.push("/admin/users");
    } catch (error) {
      notify.error("Couldn't delete user", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/users"
        className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All users
      </Link>

      <div className="card-evalora flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-lg">{initialsFromName(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
              {user.name}
              {isSelf ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  You
                </span>
              ) : null}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                {label(user.role)}
              </span>
              <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_CLASS[user.status]}`}>
                {label(user.status)}
              </span>
              {user.emailVerified ? (
                <span className="status-success inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium">
                  <BadgeCheck className="size-3" aria-hidden="true" />
                  Email verified
                </span>
              ) : (
                <span className="status-pending rounded-full border px-2.5 py-1 font-medium">Email not verified</span>
              )}
            </div>
          </div>
        </div>

        <dl className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd>{user.phone ?? "Not provided"}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Joined</dt>
              <dd>{formatDateTime(user.createdAt)}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Last sign-in</dt>
              <dd>{formatDateTime(user.lastLoginAt)}</dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="card-evalora flex flex-col gap-5 p-6">
        <div>
          <h2 className="text-base font-semibold">Access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSelf
              ? "You can't change your own role or status, or delete your own account."
              : "Changes take effect immediately. Suspending a user signs them out."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="user-role"
              value={user.role}
              disabled={isSelf || roleMutation.isPending}
              onChange={(e) => {
                const next = e.target.value as UserRole;
                if (next !== user.role) setPendingRole(next);
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="user-status"
              value={user.status}
              disabled={isSelf || statusMutation.isPending}
              onChange={(e) => {
                const next = e.target.value as UserStatus;
                if (next !== user.status) setPendingStatus(next);
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-60"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <Button
            variant="destructive"
            size="sm"
            disabled={isSelf}
            isLoading={deleteMutation.isPending}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete user
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null);
        }}
        title={pendingRole ? `Change role to ${label(pendingRole)}?` : "Change role?"}
        description={
          pendingRole === "RECRUITER"
            ? `${user.name} will still need to register a company before using recruiter features.`
            : `${user.name}'s access changes right away.`
        }
        confirmLabel="Change role"
        onConfirm={() => {
          if (pendingRole) void applyRole(pendingRole);
        }}
      />

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
        title={pendingStatus ? `Set status to ${label(pendingStatus)}?` : "Change status?"}
        description={
          pendingStatus === "SUSPENDED"
            ? `${user.name} will be signed out and lose access until reactivated.`
            : undefined
        }
        confirmLabel="Change status"
        variant={pendingStatus === "SUSPENDED" ? "destructive" : "default"}
        onConfirm={() => {
          if (pendingStatus) void applyStatus(pendingStatus);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this user?"
        description={`${user.name}'s account will be deactivated and they'll be signed out.`}
        confirmLabel="Delete user"
        variant="destructive"
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}