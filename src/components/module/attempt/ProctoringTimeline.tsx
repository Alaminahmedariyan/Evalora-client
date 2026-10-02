"use client";

import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProctoringEvents } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  PROCTORING_ICON,
  PROCTORING_LABEL,
  PROCTORING_SEVERITY,
} from "./proctoring-icons";

const skeletonItems = [
  "proctoring-skeleton-1",
  "proctoring-skeleton-2",
  "proctoring-skeleton-3",
  "proctoring-skeleton-4",
];

export function ProctoringTimeline({
  attemptId,
}: {
  attemptId: string;
}) {
  const { data, isPending, isError } = useProctoringEvents(attemptId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load the proctoring timeline.
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No proctoring events"
        description="No flagged activity was recorded during this attempt."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {data.data.map((event, index) => {
        const Icon = PROCTORING_ICON[event.eventType];
        const severity = PROCTORING_SEVERITY[event.eventType];

        return (
          <div
            key={event.id}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {index < data.data.length - 1 ? (
              <span
                className="absolute left-[15px] top-8 h-full w-px bg-border"
                aria-hidden="true"
              />
            ) : null}

            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border",
                severity === "danger"
                  ? "proctor-danger"
                  : "proctor-warning",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>

            <div className="flex-1 pt-1">
              <p className="text-sm font-medium">
                {PROCTORING_LABEL[event.eventType]}
              </p>

              <p className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}