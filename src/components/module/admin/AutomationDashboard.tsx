"use client";

import { useState } from "react";
import { CheckCircle2, Clock, RefreshCw, TriangleAlert, Workflow } from "lucide-react";

import type { AutomationEventStatus } from "@/types";
import { useAutomationEvents, useAutomationStats, useRetryAutomationEvent } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { BreakdownBadges } from "./BreakdownBadges";

const STATUSES: AutomationEventStatus[] = ["PENDING", "PROCESSING", "DELIVERED", "FAILED"];

const STATUS_CLASS: Record<AutomationEventStatus, string> = {
  PENDING: "status-pending",
  PROCESSING: "status-active",
  DELIVERED: "status-success",
  FAILED: "status-danger",
};

const SKELETON_KEYS = ["automation-sk-1", "automation-sk-2", "automation-sk-3", "automation-sk-4", "automation-sk-5"];

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function AutomationDashboard() {
  const [status, setStatus] = useState<AutomationEventStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const stats = useAutomationStats();
  const events = useAutomationEvents({
    page,
    limit: 15,
    status: status === "ALL" ? undefined : status,
  });
  const retryMutation = useRetryAutomationEvent();

  const retryingId = retryMutation.isPending ? retryMutation.variables : undefined;

  async function handleRetry(id: string) {
    try {
      await retryMutation.mutateAsync(id);
      notify.success("Event queued for retry", "It will be sent on the next dispatch run.");
    } catch (error) {
      notify.error("Couldn't retry event", isApiError(error) ? error.message : undefined);
    }
  }

  const total = stats.data?.data.total;
  const last24h = stats.data?.data.last24h;

  return (
    <div className="flex flex-col gap-6">
      {stats.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKELETON_KEYS.slice(0, 4).map((key) => (
            <Skeleton key={key} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : stats.isError || !total || !last24h ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load automation stats.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Delivered" value={total.DELIVERED} icon={CheckCircle2} accent="success">
            <p className="text-xs text-muted-foreground">{last24h.DELIVERED} in the last 24 hours</p>
          </StatCard>

          <StatCard label="Pending" value={total.PENDING + total.PROCESSING} icon={Clock} accent="warning">
            <p className="text-xs text-muted-foreground">
              {stats.data?.data.oldestPendingAt
                ? `Oldest waiting since ${formatDateTime(stats.data.data.oldestPendingAt)}`
                : "Nothing waiting"}
            </p>
          </StatCard>

          <StatCard label="Failed" value={total.FAILED} icon={TriangleAlert} accent="danger">
            <p className="text-xs text-muted-foreground">{last24h.FAILED} in the last 24 hours</p>
          </StatCard>

          <StatCard label="All events" value={STATUSES.reduce((sum, s) => sum + total[s], 0)} icon={Workflow} accent="primary">
            <BreakdownBadges data={total} />
          </StatCard>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AutomationEventStatus | "ALL");
            setPage(1);
          }}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <p className="text-xs text-muted-foreground">Refreshes every 15 seconds.</p>
      </div>

      {events.isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      ) : events.isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load automation events.</div>
      ) : !events.data?.data.length ? (
        <EmptyState
          icon={Workflow}
          title="No automation events"
          description="Events appear here when candidates submit attempts or recruiters invite people."
        />
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Retries</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.data.data.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{event.eventType}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.aggregateType} #{event.aggregateId.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[event.status]}`}>
                        {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td className="stat-number px-4 py-3">
                      {event.retryCount}/{event.maxRetries}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</td>

                    <td className="max-w-[260px] px-4 py-3 text-xs text-muted-foreground">
                      {event.lastError ? (
                        <span className="line-clamp-2" title={event.lastError}>
                          {event.lastError}
                        </span>
                      ) : event.deliveredAt ? (
                        `Delivered ${formatDateTime(event.deliveredAt)}`
                      ) : event.nextRetryAt ? (
                        `Next try ${formatDateTime(event.nextRetryAt)}`
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {event.status === "FAILED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleRetry(event.id)}
                          isLoading={retryingId === event.id}
                          disabled={retryMutation.isPending && retryingId !== event.id}
                        >
                          <RefreshCw className="size-3.5" aria-hidden="true" />
                          Retry
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={events.data.meta?.page ?? page}
            totalPages={events.data.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}