"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ScrollText } from "lucide-react";

import { useAuditLogs, useDebounce } from "@/hooks";
import type { AuditAction, AuditLog } from "@/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { AuditActionBadge } from "./AuditActionBadge";

const ACTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "STATUS_CHANGE",
  "ROLE_CHANGE",
  "PAYMENT",
  "SUBMISSION",
  "EVALUATION",
  "SECURITY",
];

const skeletonItems = [
  "audit-log-skeleton-1",
  "audit-log-skeleton-2",
  "audit-log-skeleton-3",
  "audit-log-skeleton-4",
  "audit-log-skeleton-5",
  "audit-log-skeleton-6",
];

function AuditLogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = log.oldValue || log.newValue || log.metadata;

  return (
    <>
      <tr className="interactive border-b border-border last:border-0 hover:bg-accent/50">
        <td className="w-8 px-4 py-3">
          {hasDetail ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Hide details" : "Show details"}
            >
              {expanded ? (
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </button>
          ) : null}
        </td>

        <td className="px-4 py-3">
          <AuditActionBadge action={log.action} />
        </td>

        <td className="px-4 py-3">
          <span className="font-medium">{log.entity}</span>
          {log.entityId ? (
            <span className="ml-1 text-xs text-muted-foreground">
              #{log.entityId.slice(0, 8)}
            </span>
          ) : null}
        </td>

        <td className="px-4 py-3">
          {log.user ? (
            <div>
              <p className="text-sm">{log.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {log.user.role}
              </p>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">System</span>
          )}
        </td>

        <td className="px-4 py-3 text-xs text-muted-foreground">
          {new Date(log.createdAt).toLocaleString()}
        </td>
      </tr>

      {expanded ? (
        <tr className="border-b border-border last:border-0 bg-secondary/30">
          <td colSpan={5} className="px-4 py-3">
            <div className="grid gap-3 font-mono text-xs sm:grid-cols-3">
              {log.oldValue ? (
                <div>
                  <p className="mb-1 font-sans font-medium text-muted-foreground">
                    Before
                  </p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.oldValue, null, 2)}
                  </pre>
                </div>
              ) : null}

              {log.newValue ? (
                <div>
                  <p className="mb-1 font-sans font-medium text-muted-foreground">
                    After
                  </p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </div>
              ) : null}

              {log.metadata ? (
                <div>
                  <p className="mb-1 font-sans font-medium text-muted-foreground">
                    Metadata
                  </p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>

            {log.ipAddress ? (
              <p className="mt-2 text-xs text-muted-foreground">
                IP: {log.ipAddress}
              </p>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function AuditLogsTable() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useAuditLogs({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    action: action === "ALL" ? undefined : action,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by entity (e.g. Problem, Assessment)..."
          className="max-w-xs"
        />

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value as AuditAction | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All actions</option>

          {ACTIONS.map((auditAction) => (
            <option key={auditAction} value={auditAction}>
              {auditAction.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {skeletonItems.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load audit logs.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={ScrollText}
          title="No audit log entries"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">By</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>

              <tbody>
                {data.data.map((log) => (
                  <AuditLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={data.meta?.page ?? page}
            totalPages={data.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}