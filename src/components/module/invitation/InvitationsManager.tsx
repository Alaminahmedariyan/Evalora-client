"use client";

import { useState } from "react";
import { Mail, Search, X } from "lucide-react";

import type { InvitationStatus } from "@/types";
import { useCancelInvitation, useDebounce, useInvitationsForAssessment } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationStatusBadge } from "./InvitationStatusBadge";

const STATUS_TABS: { value: InvitationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
  { value: "EXPIRED", label: "Expired" },
];

const SKELETON_ITEMS = ["invitation-row-1", "invitation-row-2", "invitation-row-3", "invitation-row-4"];

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function InvitationsManager({ assessmentId }: { assessmentId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvitationStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; email: string } | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isPending, isError } = useInvitationsForAssessment(assessmentId, {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const cancelMutation = useCancelInvitation(assessmentId);
  const cancellingId = cancelMutation.isPending ? cancelMutation.variables : undefined;

  const filtersActive = search !== "" || status !== "ALL";
  const invitations = data?.data ?? [];

  async function handleCancel(id: string) {
    try {
      await cancelMutation.mutateAsync(id);
      notify.success("Invitation cancelled");
    } catch (error) {
      notify.error("Couldn't cancel", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email..."
            aria-label="Search invitations by email"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as InvitationStatus | "ALL");
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_ITEMS.map((id) => (
            <Skeleton key={id} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load invitations.</div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={filtersActive ? "No matching invitations" : "No invitations sent yet"}
          description={
            filtersActive
              ? "Try a different search or status."
              : "Invite candidates to start collecting attempts."
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data?.meta?.total ?? invitations.length} invitation
            {(data?.meta?.total ?? invitations.length) === 1 ? "" : "s"}
          </p>

          <div className="card-evalora overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Invited</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {invitations.map((invitation) => {
                  const expired =
                    invitation.status === "PENDING" &&
                    invitation.expiresAt !== null &&
                    new Date(invitation.expiresAt).getTime() < Date.now();

                  return (
                    <tr
                      key={invitation.id}
                      className="interactive border-b border-border last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-4 py-3 font-medium">{invitation.email}</td>

                      <td className="px-4 py-3">
                        <InvitationStatusBadge status={invitation.status} />
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(invitation.invitedAt)}</td>

                      <td className={cn("px-4 py-3 text-xs", expired ? "text-danger" : "text-muted-foreground")}>
                        {formatDate(invitation.expiresAt)}
                        {expired ? " (expired)" : ""}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {invitation.status === "PENDING" ? (
                            <button
                              type="button"
                              disabled={cancellingId === invitation.id}
                              onClick={() => setCancelTarget({ id: invitation.id, email: invitation.email })}
                              className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                              aria-label={`Cancel invitation to ${invitation.email}`}
                            >
                              <X className="size-4" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination page={data?.meta?.page ?? page} totalPages={data?.meta?.totalPage ?? 1} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel this invitation?"
        description={cancelTarget ? `${cancelTarget.email} will no longer be able to accept it.` : undefined}
        confirmLabel="Cancel invitation"
        variant="destructive"
        onConfirm={() => {
          if (cancelTarget) void handleCancel(cancelTarget.id);
        }}
      />
    </div>
  );
}